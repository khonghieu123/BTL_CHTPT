"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { setApiToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface AppContextType {
  userId: number | null;
  username: string | null;
  token: string | null;
  role: "ADMIN" | "CUSTOMER" | null;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  login: (
    username: string,
    token: string,
    role: string,
    fullName?: string,
    phone?: string,
    address?: string,
    userId?: number
  ) => void;
  logout: () => void;
  updateProfileState: (fullName: string, phone: string, address: string) => void;
  addToCart: (product: { id: number; name: string; price: number }) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise DB role strings (ROLE_ADMIN / ROLE_USER) to front-end enum */
function normaliseRole(raw: string | null): "ADMIN" | "CUSTOMER" {
  if (raw === "ROLE_ADMIN" || raw === "ADMIN") return "ADMIN";
  return "CUSTOMER";
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"ADMIN" | "CUSTOMER" | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Rehydrate state from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken    = localStorage.getItem("token");
    const storedUser     = localStorage.getItem("username");
    const storedRole     = localStorage.getItem("role");
    const storedFullName = localStorage.getItem("fullName");
    const storedPhone    = localStorage.getItem("phone");
    const storedAddress  = localStorage.getItem("address");
    const storedCart     = localStorage.getItem("cart");
    const storedUserId   = localStorage.getItem("userId");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setApiToken(storedToken);
      setUsername(storedUser);
      setRole(normaliseRole(storedRole));
      setFullName(storedFullName || "");
      setPhone(storedPhone || "");
      setAddress(storedAddress || "");
      setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
    }

    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch { /* corrupted – ignore */ }
    }

    setIsInitialized(true);
  }, []);

  // Persist cart on every change (after init)
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, isInitialized]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const login = (
    newUser: string,
    newToken: string,
    newRole: string,
    newFullName?: string,
    newPhone?: string,
    newAddress?: string,
    newUserId?: number
  ) => {
    const mappedRole = normaliseRole(newRole);

    setToken(newToken);
    setApiToken(newToken);
    setUsername(newUser);
    setRole(mappedRole);
    setFullName(newFullName || "");
    setPhone(newPhone || "");
    setAddress(newAddress || "");
    // Use the server-issued userId; do NOT fall back to hard-coded values
    setUserId(newUserId ?? null);

    localStorage.setItem("token",    newToken);
    localStorage.setItem("username", newUser);
    localStorage.setItem("role",     mappedRole);
    localStorage.setItem("fullName", newFullName || "");
    localStorage.setItem("phone",    newPhone    || "");
    localStorage.setItem("address",  newAddress  || "");
    if (newUserId != null) {
      localStorage.setItem("userId", newUserId.toString());
    }

    const greeting = mappedRole === "ADMIN"
      ? `Chào mừng Quản Trị Viên, ${newUser}!`
      : `Chào mừng quay lại, ${newUser}!`;
    toast.success(greeting);
  };

  const logout = () => {
    setToken(null);
    setApiToken(null);
    setUsername(null);
    setRole(null);
    setFullName(null);
    setPhone(null);
    setAddress(null);
    setUserId(null);
    setCart([]);

    ["token", "username", "role", "fullName", "phone", "address", "userId", "cart"]
      .forEach((k) => localStorage.removeItem(k));

    toast.info("Đã đăng xuất thành công");
  };

  const updateProfileState = (newFullName: string, newPhone: string, newAddress: string) => {
    setFullName(newFullName);
    setPhone(newPhone);
    setAddress(newAddress);
    localStorage.setItem("fullName", newFullName);
    localStorage.setItem("phone",    newPhone);
    localStorage.setItem("address",  newAddress);
  };

  // ── Cart actions ────────────────────────────────────────────────────────────

  const addToCart = (product: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        toast.success(`Tăng số lượng ${product.name} lên ${existing.quantity + 1}`);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (!item) return prev;
      if (item.quantity > 1) {
        toast.info(`Giảm một lượng ${item.name} trong giỏ`);
        return prev.map((i) => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      toast.error(`Đã bỏ sản phẩm ${item.name} khỏi giỏ hàng`);
      return prev.filter((i) => i.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") localStorage.removeItem("cart");
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((n, i) => n + i.price * i.quantity, 0);

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        userId, username, token, role,
        fullName, phone, address,
        cart, cartCount, cartTotal,
        login, logout, updateProfileState,
        addToCart, removeFromCart, clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

import axios from "axios";

// ─── In-memory token ──────────────────────────────────────────────────────────
// Stored in module scope (not localStorage) so each browser tab has an
// independent session and tabs cannot overwrite each other's tokens.
let sessionToken: string | null = null;

export const setApiToken = (token: string | null) => {
  sessionToken = token;
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach token before every request
api.interceptors.request.use((config) => {
  const token =
    sessionToken ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Shared TypeScript interfaces ─────────────────────────────────────────────

export interface ProductVariant {
  id: number;
  capacity?: string;
  color?: string;
  priceOffset: number;
  stockQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  stockQuantity?: number;
  sku?: string;
  imageUrl?: string;
  imageHue?: number;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  specs?: Record<string, string>;
  variants?: ProductVariant[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: number;
  customerEmail?: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

// ─── Generic API call helper ──────────────────────────────────────────────────

export const apiCall = async (
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: unknown
): Promise<any> => {
  const response = await api({ method, url, data });
  return response.data;
};

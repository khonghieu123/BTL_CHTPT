"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Home, ShoppingBag, ShoppingCart, FileText, LogOut, ShieldCheck, LayoutDashboard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { username, role, login, logout, cartCount } = useApp();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/products", label: "Sản phẩm", icon: ShoppingBag },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingCart, badge: cartCount },
    { href: "/order-history", label: "Đơn hàng", icon: FileText },
    { href: "/profile", label: "Cá nhân", icon: User },
  ];

  // If user is Admin, add Admin Panel to the Navigation
  if (role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Quản trị", icon: LayoutDashboard });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo with a futuristic gradient hover */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-650 shadow-lg shadow-purple-950/30 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <ShieldCheck className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-zinc-100 group-hover:text-purple-400 text-base font-black tracking-tight transition-all duration-300">
              Apex Portal
            </span>
          </Link>
        </div>

        {/* Navigation Links with animated sliding cover */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" 
              ? pathname.startsWith("/admin") 
              : pathname === item.href;
            const Icon = item.icon;
            
            // Special color for Admin link
            const isAdminLink = item.href === "/admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : isAdminLink
                      ? "text-fuchsia-400/80 hover:text-fuchsia-300 hover:bg-fuchsia-950/20"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-900/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavCover"
                    className={`absolute inset-0 rounded-xl -z-10 border ${
                      isAdminLink 
                        ? "bg-fuchsia-950/20 border-fuchsia-900/40 shadow-lg"
                        : "bg-zinc-800/60 border-zinc-700/50 shadow-lg"
                    }`}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                
                <Icon className={`h-4.5 w-4.5 transition-colors ${
                  isActive 
                    ? isAdminLink 
                      ? "text-fuchsia-400"
                      : "text-purple-400" 
                    : isAdminLink 
                      ? "text-fuchsia-500"
                      : "text-zinc-400 group-hover:text-zinc-300"
                }`} />
                <span>{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={item.badge}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-black text-white shadow shadow-purple-500/30"
                    >
                      {item.badge}
                    </motion.span>
                  </AnimatePresence>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Session Info / Logout with glowing capsule buttons */}
        <div className="flex items-center gap-4">
          {username ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
                    {role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                  </span>
                  <span className="text-sm font-black text-zinc-250">
                    {username}
                  </span>
                </div>
                
                {role === "ADMIN" && (
                  <button
                    onClick={() => {
                      login("A", "mockTokenPayloadInfoFor_A", "CUSTOMER");
                      router.push("/products");
                    }}
                    className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition duration-150 active:scale-95 border bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    title="Chuyển nhanh phân quyền trải nghiệm sang Khách"
                  >
                    ⚡ Sang Khách
                  </button>
                )}
              </div>
              
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black shadow-md ${
                role === "ADMIN" 
                  ? "bg-fuchsia-950/60 border-fuchsia-800 text-fuchsia-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300"
              }`}>
                {username.substring(0, 2).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-zinc-900/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/30 transition-all duration-300 shadow-sm active:scale-95"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white transition-all duration-300 shadow-lg shadow-purple-500/10 active:scale-95"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden items-center justify-around border-t border-zinc-800 bg-[#09090b] px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname.startsWith("/admin") 
            : pathname === item.href;
          const Icon = item.icon;
          const isAdminLink = item.href === "/admin";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-extrabold relative transition-colors ${
                isActive 
                  ? "text-purple-400 font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="relative">
                <Icon className="h-4.5 w-4.5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

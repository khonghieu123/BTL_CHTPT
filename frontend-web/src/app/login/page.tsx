"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, User, Loader2, ArrowRight, Sparkles, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const { login, token, role } = useApp();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // If already logged in, redirect based on role
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    
    if (token || storedToken) {
      if ((role || storedRole) === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
    }
  }, [token, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameInput.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!passwordInput) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);
    
    const loginPromise = apiCall("post", "/auth/login", {
      username: usernameInput.trim(),
      password: passwordInput,
    });

    toast.promise(loginPromise, {
      loading: "Đang kiểm tra bảo mật tài khoản...",
      success: (data) => {
        setIsLoading(false);
        login(data.username, data.token, data.role, data.fullName, data.phone, data.address, data.id);
        
        if (data.role === "ADMIN") {
          router.push("/admin");
          return "Chào mừng Admin! Đang kết nối trung tâm điều khiển...";
        } else {
          router.push("/products");
          return "Đăng nhập thành công! Đang mở cửa hàng...";
        }
      },
      error: (err: any) => {
        setIsLoading(false);
        const errMsg = err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản!";
        return errMsg;
      },
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerUsername.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("Mật khẩu phải chứa ít nhất 6 ký tự");
      return;
    }

    setIsRegisterLoading(true);

    const registerPromise = apiCall("post", "/auth/register", {
      username: registerUsername.trim(),
      email: registerEmail.trim(),
      password: registerPassword,
    });

    toast.promise(registerPromise, {
      loading: "Đang tạo tài khoản mới...",
      success: (data) => {
        setIsRegisterLoading(false);
        login(data.username, data.token, data.role || "CUSTOMER", data.fullName, data.phone, data.address, data.id);
        router.push("/products");
        return `Đăng ký thành công! Chào mừng ${data.username} đến với Apex Portal!`;
      },
      error: (err: any) => {
        setIsRegisterLoading(false);
        const errMsg = err?.response?.data?.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại!";
        return errMsg;
      },
    });
  };

  const handleQuickFill = (user: string) => {
    setUsernameInput(user);
    setPasswordInput("admin123");
    toast.info(`Đã tự động điền tài khoản: ${user}`);
  };

  return (
    <div className="relative flex min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      
      {/* Dynamic Glowing Mesh Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      
      {/* Soft light bubbles */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-500/5 via-indigo-500/5 to-transparent opacity-40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-fuchsia-500/5 via-cyan-500/5 to-transparent opacity-30 blur-[100px] pointer-events-none" />
 
      {/* Main Grid Wrapper */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-4 z-10">
        
        {/* Left Side: Stunning Cyberpunk Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between py-16 pr-12">
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-650 to-indigo-650 shadow-lg shadow-purple-950/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-base font-black tracking-tight">
              Apex Portal
            </span>
          </div>
 
          {/* Core Graphic Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1 text-xs font-bold text-purple-400 shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              Cổng dịch vụ thế hệ mới 2.0
            </div>
            
            <h1 className="text-4xl font-black tracking-tight leading-[1.15] text-white">
              Trải nghiệm mua sắm <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Hiệu năng cao & Bảo mật
              </span>
            </h1>
            
            <p className="text-zinc-300 text-xs max-w-lg leading-relaxed font-bold">
              Hệ thống tích hợp bảng quản trị chuyên sâu dành cho Admin, phân loại danh mục sản phẩm, đặt hàng tự động và quản lý người dùng tập trung bằng công nghệ tối tân.
            </p>
 
            {/* Glowing mini cards of system features */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl">
              <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                <Users className="h-5 w-5 text-purple-400 mb-2" />
                <div className="text-base font-extrabold text-white">12,400+</div>
                <div className="text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Khách hàng active</div>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                <ShoppingBag className="h-5 w-5 text-indigo-400 mb-2" />
                <div className="text-base font-extrabold text-white">100%</div>
                <div className="text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Tự động hóa đơn</div>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                <TrendingUp className="h-5 w-5 text-cyan-400 mb-2" />
                <div className="text-base font-extrabold text-white">&lt; 150ms</div>
                <div className="text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Độ trễ API</div>
              </div>
            </div>
          </div>
 
          {/* Footer branding copy */}
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            © 2026 Apex Systems Inc. Thiết kế bảo mật toàn diện.
          </div>
        </div>
 
        {/* Right Side: Ultimate Glassmorphic Sign In Panel */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center py-16">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
          >
            
            {/* Visual Logo on Mobile screen */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-650 shadow-lg">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">Apex Portal</span>
            </div>
 
            <Card className="border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md shadow-2xl relative rounded-2xl">
              
              {/* Internal neon subtle aura glow */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-650/5 rounded-full blur-xl pointer-events-none" />
              
              <CardHeader className="space-y-1.5 pb-6">
                <CardTitle className="text-xl font-extrabold tracking-tight text-white flex items-center justify-between">
                  <span>{isRegistering ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}</span>
                  <span className="text-[9px] bg-zinc-950 text-purple-400 border border-zinc-800 font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">
                    {isRegistering ? "Register" : "Secure"}
                  </span>
                </CardTitle>
                <CardDescription className="text-zinc-300 text-xs font-medium leading-relaxed">
                  {isRegistering 
                    ? "Tạo tài khoản khách hàng mới để trải nghiệm mua sắm phụ kiện công nghệ cao cấp tại Apex Portal."
                    : "Truy cập cổng mua sắm và quản lý bán hàng của Apex Portal."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isRegistering ? (
                  /* ================= REGISTER FORM ================= */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    
                    {/* Register Username */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Tên đăng nhập</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          type="text"
                          placeholder="Nhập tên tài khoản của bạn..."
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          disabled={isRegisterLoading}
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>

                    {/* Register Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Địa chỉ Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <Input
                          type="email"
                          placeholder="vi-du@gmail.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          disabled={isRegisterLoading}
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>

                    {/* Register Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Mật khẩu</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input
                          type="password"
                          placeholder="Tối thiểu 6 ký tự bảo mật..."
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          disabled={isRegisterLoading}
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isRegisterLoading}
                      className="mt-2 w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-all duration-200 py-3.5 font-black shadow active:scale-[0.98] rounded-xl text-xs"
                    >
                      {isRegisterLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-900" />
                          Đang khởi tạo tài khoản...
                        </>
                      ) : (
                        <>
                          Đăng Ký Tài Khoản Mới
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setIsRegistering(false)}
                        className="text-xs font-black text-purple-400 hover:text-purple-300 transition hover:underline"
                      >
                        Đã có tài khoản? Đăng nhập ngay
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ================= LOGIN FORM ================= */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Account entry */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Tên đăng nhập / Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          type="text"
                          placeholder="Nhập tên đăng nhập (ví dụ: A, admin)..."
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          disabled={isLoading}
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-450 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>
 
                    {/* Password entry */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Mật khẩu bảo mật</label>
                        <a href="#" className="text-[9px] font-bold text-zinc-400 hover:text-purple-300 transition">Quên mật khẩu?</a>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          disabled={isLoading}
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-450 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>
 
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-all duration-200 py-3.5 font-black shadow active:scale-[0.98] rounded-xl text-xs"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-900" />
                          Đang xác thực thông tin...
                        </>
                      ) : (
                        <>
                          Xác nhận Đăng Nhập
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="text-xs font-black text-purple-400 hover:text-purple-300 transition hover:underline"
                      >
                        Chưa có tài khoản? Đăng ký tài khoản mới
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
 
              {/* Advanced helper panel for testing - ONLY SHOW IN LOGIN MODE */}
              {!isRegistering && (
                <CardFooter className="flex flex-col space-y-3.5 border-t border-zinc-800/80 pt-5 bg-zinc-950/40 rounded-b-2xl">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 text-center w-full">
                    Lựa chọn tài khoản demo (Bấm để điền nhanh)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleQuickFill("A")}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-sm transition duration-200"
                    >
                      <span className="text-xs font-extrabold">Khách hàng A</span>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase mt-0.5">CUSTOMER</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("admin")}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-fuchsia-950/20 hover:border-fuchsia-800/40 text-fuchsia-400 hover:text-fuchsia-300 shadow-sm transition duration-200"
                    >
                      <span className="text-xs font-extrabold">Quản trị viên</span>
                      <span className="text-[8px] font-bold text-fuchsia-550 uppercase mt-0.5">ADMIN</span>
                    </button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Shield, Check, Loader2, ArrowLeft, Save, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { token, username, role, fullName, phone, address, updateProfileState } = useApp();

  const [emailInput, setEmailInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!token && typeof window !== "undefined" && !localStorage.getItem("token")) {
      toast.error("Vui lòng đăng nhập để truy cập thông tin cá nhân!");
      router.push("/login");
    }
  }, [token, router]);

  // Fetch current user details from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Decode user ID from token or retrieve user details
        const storedToken = token || localStorage.getItem("token");
        if (!storedToken) return;

        // Validate token to get user ID
        const valData = await apiCall("get", `/auth/validate?token=${storedToken}`);
        if (valData && valData.userId) {
          const userData = await apiCall("get", `/auth/users/${valData.userId}`);
          setEmailInput(userData.email || "");
          setFullNameInput(userData.fullName || "");
          setPhoneInput(userData.phone || "");
          setAddressInput(userData.address || "");
          
          // Sync state to Context
          updateProfileState(userData.fullName || "", userData.phone || "", userData.address || "");
        }
      } catch (err: any) {
        console.error("Lỗi khi tải thông tin người dùng từ server:", err);
        // Fallback to Context State if offline
        setFullNameInput(fullName || "");
        setPhoneInput(phone || "");
        setAddressInput(address || "");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedToken = token || localStorage.getItem("token");
      if (!storedToken) throw new Error("Chưa đăng nhập");

      // Validate token to get user ID
      const valData = await apiCall("get", `/auth/validate?token=${storedToken}`);
      if (!valData || !valData.userId) throw new Error("Xác thực thất bại");

      const updatePromise = apiCall("put", `/auth/profile/${valData.userId}`, {
        email: emailInput.trim(),
        fullName: fullNameInput.trim(),
        phone: phoneInput.trim(),
        address: addressInput.trim(),
      });

      toast.promise(updatePromise, {
        loading: "Đang lưu thông tin lên cơ sở dữ liệu...",
        success: (updatedUser) => {
          setIsLoading(false);
          // Sync to Context and LocalStorage
          updateProfileState(updatedUser.fullName || "", updatedUser.phone || "", updatedUser.address || "");
          return "Cập nhật hồ sơ cá nhân thành công!";
        },
        error: (err) => {
          setIsLoading(false);
          return err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại!";
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-16">
      <Navbar />

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      {/* Soft light bubbles */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-4 pt-24 z-10 relative">
        {/* Back Button */}
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition duration-200 mb-6 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2 backdrop-blur-md self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Cửa hàng
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Glassmorphic Profile Card */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-2xl relative rounded-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-650 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4 border-2 border-zinc-800">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
                <h2 className="text-lg font-black text-white">{username || "Người dùng"}</h2>
                <span className="text-[9px] bg-zinc-950 text-purple-400 border border-zinc-850 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
                  {role || "CUSTOMER"}
                </span>

                <div className="w-full border-t border-zinc-800/80 my-4" />

                <div className="w-full space-y-3.5 text-left text-xs font-bold text-zinc-400">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="truncate">{emailInput || "chưa cập nhật email"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Tài khoản xác thực JWT</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md rounded-2xl p-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-2">Vì sao cần cập nhật?</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-bold">
                Việc cung cấp đầy đủ họ tên nhận hàng, số điện thoại chính xác và địa chỉ giao hàng chi tiết giúp đảm bảo quá trình vận chuyển các mặt hàng công nghệ cao cấp có giá trị cao của bạn diễn ra an toàn, nhanh chóng và không bị thất lạc.
              </p>
            </Card>
          </div>

          {/* Right Column: Update Profile Form */}
          <div className="md:col-span-8">
            <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-white flex items-center justify-between">
                  <span>Hồ Sơ & Địa Chỉ Nhận Hàng</span>
                  <span className="text-[10px] text-zinc-500 font-bold">PTIT CYBER PORTAL</span>
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs font-bold">
                  Thiết lập địa chỉ giao nhận hàng mặc định để tự động áp dụng khi đặt mua hàng nhanh chóng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetching ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                    <span className="text-xs font-bold text-zinc-400">Đang tải dữ liệu hồ sơ của bạn...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    {/* Username (Disabled) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Tên đăng nhập</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                            <User className="h-4 w-4" />
                          </span>
                          <Input
                            type="text"
                            value={username || ""}
                            disabled
                            className="border-zinc-800 bg-zinc-950/40 pl-10 text-zinc-450 rounded-xl text-xs h-11 font-extrabold cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Địa chỉ Email</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <Input
                            type="email"
                            placeholder="Nhập email liên hệ..."
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            disabled={isLoading}
                            required
                            className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full border-t border-zinc-800/80 my-2" />

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Họ và Tên Nhận Hàng</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A..."
                          value={fullNameInput}
                          onChange={(e) => setFullNameInput(e.target.value)}
                          disabled={isLoading}
                          required
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Số Điện Thoại Liên Hệ</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                          <Phone className="h-4 w-4" />
                        </span>
                        <Input
                          type="text"
                          placeholder="Ví dụ: 0987654321..."
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          disabled={isLoading}
                          required
                          className="border-zinc-800 bg-zinc-950/60 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs h-11 font-medium"
                        />
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Địa Chỉ Nhận Hàng (Chính xác)</label>
                      <div className="relative">
                        <span className="absolute top-3.5 left-3 text-zinc-400">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <textarea
                          placeholder="Nhập địa chỉ nhận hàng chi tiết (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố)..."
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          disabled={isLoading}
                          required
                          rows={3}
                          className="w-full border border-zinc-800 bg-zinc-950/60 pl-10 pr-3 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs font-medium resize-none focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-all duration-200 py-3.5 font-black shadow active:scale-[0.98] rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                            Đang lưu thông tin cá nhân...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 text-zinc-900" />
                            Lưu Hồ Sơ & Địa Chỉ Giao Hàng
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

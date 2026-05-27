"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Trash2, CreditCard, Mail, User, MapPin, 
  Phone, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  QrCode, Landmark, DollarSign, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { 
    userId, token, cart, cartCount, cartTotal, addToCart, removeFromCart, clearCart,
    fullName: profileFullName, phone: profilePhone, address: profileAddress, username
  } = useApp();
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  // Autofill form fields with Profile defaults
  useEffect(() => {
    if (profileFullName) setFullName(profileFullName);
    if (profilePhone) setPhone(profilePhone);
    if (profileAddress) setAddress(profileAddress);
    
    const storedUsername = username || localStorage.getItem("username");
    if (storedUsername) {
      setEmail(storedUsername === "admin" ? "admin@apex.com" : `${storedUsername.toLowerCase()}@gmail.com`);
    }
  }, [profileFullName, profilePhone, profileAddress, username]);
  
  // Validation & Loading States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VNPAY Simulator Modal State
  const [showVNPAYModal, setShowVNPAYModal] = useState(false);
  const [simulatedOrderId, setSimulatedOrderId] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes timer

  // Authentication guard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!token && !storedToken) {
      router.push("/");
    }
  }, [token, router]);

  // Countdown timer for simulated VNPAY QR
  useEffect(() => {
    if (!showVNPAYModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowVNPAYModal(false);
          toast.error("Giao dịch VNPAY đã hết hạn thanh toán!");
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showVNPAYModal]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Format Currency VND
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) errors.fullName = "Họ tên không được để trống";
    if (!address.trim()) errors.address = "Địa chỉ giao hàng không được để trống";
    if (!phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (phone.length < 9) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    if (!email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      errors.email = "Định dạng Email không hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle order submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!validateForm()) {
      toast.warning("Vui lòng sửa các lỗi nhập liệu trước khi đặt hàng");
      return;
    }

    setIsSubmitting(true);

    // Format target payload matching Spring Boot REST endpoint specs
    const payload = {
      userId: userId || 5,
      email: email,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: paymentMethod
    };

    try {
      // Create the order first (in PENDING state)
      const data = await apiCall("post", "/orders", payload);
      const createdOrderId = data.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setSimulatedOrderId(createdOrderId);

      if (paymentMethod === "VNPAY") {
        // Show VNPAY Sandbox simulator
        setIsSubmitting(false);
        setCountdown(300);
        setShowVNPAYModal(true);
      } else {
        // COD workflow immediately completes
        toast.success(`Đặt hàng COD thành công! Mã đơn: ${createdOrderId}`);
        clearCart();
        setIsSubmitting(false);
        router.push("/order-history");
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("Order failed:", err);
      toast.error("Đặt hàng thất bại. Vui lòng kết nối lại!");
    }
  };

  // Simulate VNPAY payment success
  const handleVNPAYSuccess = async () => {
    setShowVNPAYModal(false);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "VNPAY IPN đang phản hồi và xác nhận giao dịch...",
        success: () => {
          clearCart();
          router.push("/order-history");
          return `Thanh toán VNPAY thành công cho đơn hàng: ${simulatedOrderId}`;
        },
        error: "Giao dịch không hợp lệ!"
      }
    );
  };

  // Simulate VNPAY payment cancel
  const handleVNPAYCancel = () => {
    setShowVNPAYModal(false);
    toast.warning(`Giao dịch thanh toán đã bị hủy. Đơn hàng ${simulatedOrderId} được chuyển sang trạng thái THẤT BẠI/HỦY.`);
    clearCart();
    router.push("/order-history");
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber Grid Background Leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="text-zinc-350 hover:text-white p-0 hover:bg-transparent flex items-center gap-2 text-sm font-black uppercase tracking-wider transition"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Quay lại mua sắm
          </Button>
        </div>

        {/* Dynamic Cart Layout */}
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-2xl p-8 max-w-lg mx-auto shadow-2xl"
          >
            <div className="h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
              <ShoppingCart className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-zinc-400 text-sm max-w-sm mb-8 font-semibold leading-relaxed">
              Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng. Hãy khám phá kho hàng công nghệ của chúng tôi để mua sắm ngay!
            </p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-extrabold rounded-xl py-3 px-8 text-sm transition shadow-lg shadow-white/5 active:scale-95"
            >
              Mua sắm ngay
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Column: Cart List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <ShoppingCart className="h-5.5 w-5.5 text-purple-400 animate-pulse" />
                  Giỏ Hàng ({cartCount} sản phẩm)
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearCart();
                    toast.info("Đã dọn dẹp giỏ hàng");
                  }}
                  className="text-zinc-400 hover:text-red-400 text-sm font-extrabold uppercase hover:bg-transparent"
                >
                  Xóa tất cả
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 120 }}
                      className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#131316]/90 backdrop-blur-md justify-between shadow-xl group hover:border-zinc-700 transition duration-200"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-base font-black text-white group-hover:text-purple-400 transition-colors truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Đơn giá:</span>
                          <span className="font-bold text-zinc-300">{formatVND(item.price)}</span>
                        </div>
                      </div>

                      {/* Quantity Toggles */}
                      <div className="flex items-center gap-3.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-inner">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-white px-2 text-base font-black transition active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-sm font-black text-white w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                          className="text-zinc-400 hover:text-white px-2 text-base font-black transition active:scale-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Thành tiền</span>
                        <div className="text-sm font-black text-purple-400 font-mono">
                          {formatVND(item.price * item.quantity)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Bill summary on left */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#131316]/50 backdrop-blur-md flex flex-col gap-3 mt-4 shadow-xl">
                <div className="flex justify-between text-sm font-bold text-zinc-300">
                  <span>Tổng tiền sản phẩm</span>
                  <span className="text-zinc-150 font-mono font-bold">{formatVND(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-300">
                  <span>Giao hàng nhanh</span>
                  <span className="text-purple-400 font-black">Miễn phí (Demo)</span>
                </div>
                <div className="border-t border-zinc-800/80 my-2 pt-3 flex justify-between font-black text-white text-base">
                  <span>Tổng cộng thanh toán</span>
                  <span className="text-purple-400 text-lg font-mono">{formatVND(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="lg:col-span-5">
              <Card className="border-zinc-800 bg-[#131316] backdrop-blur-md shadow-2xl rounded-2xl sticky top-24 overflow-hidden">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-base font-black text-white flex items-center gap-2.5">
                    <CreditCard className="h-5.5 w-5.5 text-purple-400" />
                    Thông Tin Thanh Toán
                  </CardTitle>
                  <CardDescription className="text-zinc-350 text-sm font-semibold mt-1">
                    Hoàn tất thông tin giao hàng để tiến hành thanh toán và xử lý đơn.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-5">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-300">Họ và tên</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <User className="h-4.5 w-4.5" />
                      </span>
                      <Input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                        }}
                        disabled={isSubmitting}
                        className={`border-zinc-800 bg-zinc-950/80 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-sm font-extrabold h-11 ${
                          formErrors.fullName ? "border-red-500/50 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <span className="text-xs text-red-400 font-extrabold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Address field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-300">Địa chỉ nhận hàng</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <MapPin className="h-4.5 w-4.5" />
                      </span>
                      <Input
                        type="text"
                        placeholder="Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (formErrors.address) setFormErrors({ ...formErrors, address: "" });
                        }}
                        disabled={isSubmitting}
                        className={`border-zinc-800 bg-zinc-950/80 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-sm font-extrabold h-11 ${
                          formErrors.address ? "border-red-500/50 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {formErrors.address && (
                      <span className="text-xs text-red-400 font-extrabold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.address}
                      </span>
                    )}
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-300">Số điện thoại</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <Input
                        type="tel"
                        placeholder="0987654321"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                        }}
                        disabled={isSubmitting}
                        className={`border-zinc-800 bg-zinc-950/80 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-sm font-extrabold h-11 ${
                          formErrors.phone ? "border-red-500/50 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="text-xs text-red-400 font-extrabold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-300">Địa chỉ Email</label>
                      <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest bg-purple-950/30 px-2 py-0.5 rounded border border-purple-900/30">
                        Rất quan trọng
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <Input
                        type="email"
                        placeholder="nguyenvana@gmail.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                        }}
                        disabled={isSubmitting}
                        className={`border-zinc-800 bg-zinc-950/80 pl-10 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-sm font-extrabold h-11 ${
                          formErrors.email ? "border-red-500/50 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {formErrors.email ? (
                      <span className="text-xs text-red-400 font-extrabold flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.email}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 block leading-normal font-semibold mt-1">
                        Email này dùng để gửi thông báo tự động hóa đơn số của hệ thống.
                      </span>
                    )}
                  </div>

                  {/* PAYMENT METHOD SELECTOR */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-300 block">Phương thức thanh toán</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition duration-200 ${
                          paymentMethod === "COD"
                            ? "bg-purple-950/20 border-purple-500 text-purple-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        <span className="text-xs font-black">💵 COD nhận hàng</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("VNPAY")}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition duration-200 ${
                          paymentMethod === "VNPAY"
                            ? "bg-purple-950/20 border-purple-500 text-purple-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <QrCode className="h-5 w-5" />
                        <span className="text-xs font-black">💳 Cổng VNPAY</span>
                      </button>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-zinc-800/80 p-6 bg-zinc-950/70">
                  <div className="flex justify-between w-full font-black text-white text-base">
                    <span>Tổng thanh toán</span>
                    <span className="text-purple-400 text-lg font-mono">{formatVND(cartTotal)}</span>
                  </div>
                  
                  <Button
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-zinc-100 text-zinc-900 hover:bg-white transition duration-200 py-3.5 font-extrabold rounded-xl active:scale-[0.98] disabled:opacity-40 text-sm shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-zinc-900" />
                        Đang tạo đơn hàng...
                      </>
                    ) : (
                      <>
                        Xác nhận đặt đơn hàng
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
          </div>
        )}
      </main>

      {/* VNPAY SANDBOX INTERACTIVE SIMULATOR MODAL */}
      <AnimatePresence>
        {showVNPAYModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6.5 max-w-md w-full shadow-2xl relative space-y-6"
            >
              {/* Header Branding */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-red-650 to-blue-650 flex items-center justify-center text-white text-[10px] font-black">
                    VN
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white leading-tight">Cổng Thanh Toán VNPAY</h3>
                    <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-wider">Sandbox Environment</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-black block">Hết hạn sau</span>
                  <span className="text-xs font-black text-purple-400 font-mono">{formatTimer(countdown)}</span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-zinc-950/60 border border-zinc-900 p-4.5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-black">ĐƠN VỊ THỤ HƯỞNG</span>
                  <span className="text-white font-extrabold">APEX CYBER STORE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-black">MÃ ĐƠN HÀNG</span>
                  <span className="text-purple-400 font-mono font-black">{simulatedOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-black">NỘI DUNG CHUYỂN KHOẢN</span>
                  <span className="text-white font-bold truncate max-w-[200px]">Thanh toan don hang {simulatedOrderId}</span>
                </div>
                <div className="border-t border-zinc-900/60 my-2 pt-2 flex justify-between text-sm">
                  <span className="text-zinc-400 font-black">SỐ TIỀN CẦN THANH TOÁN</span>
                  <span className="text-emerald-400 font-black font-mono text-base">{formatVND(cartTotal)}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-zinc-800 shadow-inner max-w-[240px] mx-auto relative group">
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                <QrCode className="h-44 w-44 text-zinc-950" />
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase mt-2.5 tracking-wider block">
                  Quét QR để thanh toán qua app ngân hàng
                </span>
              </div>

              {/* Simulation Actions */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={handleVNPAYCancel}
                  className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/20 text-xs font-black transition active:scale-95"
                >
                  Hủy Giao Dịch
                </button>
                <button
                  type="button"
                  onClick={handleVNPAYSuccess}
                  className="px-4 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black transition active:scale-95 shadow-lg"
                >
                  Xác Nhận Đã Quét QR
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

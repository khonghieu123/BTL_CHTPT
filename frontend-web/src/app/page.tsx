"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, ShieldCheck, ShoppingBag, 
  Cpu, Zap, Award, Star, Volume2, Gamepad2, Tv,
  ChevronRight, Heart, ArrowUpRight, TrendingUp, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { username, addToCart } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured products from the microservice catalog
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiCall("get", "/products");
        // Ensure perfect normalization of database fields to front-end schema
        const normalizedData = (data || []).map((p: any) => ({
          ...p,
          price: p.price ?? 0,
          stock: p.stock ?? p.stockQuantity ?? 0,
          category: p.category ?? "Gaming",
          description: p.description ?? "Trải nghiệm dòng sản phẩm công nghệ cao cấp thế hệ mới tại Apex Cyber Store.",
          rating: p.rating ?? 4.8,
          reviewsCount: p.reviewsCount ?? 64,
          imageUrl: p.imageUrl && p.imageUrl.trim() !== "" 
            ? p.imageUrl 
            : "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop"
        }));
        // Take the top 3 high-rated products as featured showcase
        const sorted = [...normalizedData]
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 3);
        setFeaturedProducts(sorted);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleQuickBuy = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng thành công!`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber ambient backgrounds */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[700px] w-[1200px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.08),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-16 pb-12 sm:px-6 lg:px-8 sm:pt-24 sm:pb-16 flex flex-col items-center text-center">
        
        {/* Futuristic glowing capsule badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-purple-950/20 border border-purple-900/40 rounded-full px-4.5 py-1.5 text-xs font-black text-purple-400 shadow-xl backdrop-blur-md mb-6"
        >
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
          <span>Siêu Siêu Khuyến Mãi Hè 2026 - Giảm giá tới 40%</span>
        </motion.div>

        {/* Massive sleek gradient heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white max-w-4xl"
        >
          Cổng Công Nghệ Tương Lai <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            Hiệu Năng Vượt Trội & Sang Trọng
          </span>
        </motion.h1>

        {/* Clear subtitle with premium typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-350 text-sm sm:text-base font-semibold max-w-2xl mt-6 leading-relaxed"
        >
          Apex Portal phân phối các thiết bị công nghệ cao cấp hàng đầu Việt Nam. Tích hợp thanh toán an toàn, kiểm kho tự động bằng microservices và hóa đơn điện tử tự động hóa.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4.5 mt-10 w-full sm:w-auto"
        >
          <Link href="/products" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm px-8 py-6 rounded-2xl flex items-center justify-center gap-2 transition duration-300 shadow-xl active:scale-95">
              Vào Cửa Hàng Ngay
              <ArrowRight className="h-4.5 w-4.5 text-zinc-950" />
            </Button>
          </Link>
          
          {!username ? (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:text-white hover:bg-zinc-900 font-extrabold text-sm px-8 py-6 rounded-2xl transition duration-300 active:scale-95">
                Đăng Nhập Ưu Đãi
              </Button>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-2xl text-xs font-bold text-zinc-400">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
              <span>Chào mừng quay lại, <b className="text-white">{username}</b></span>
            </div>
          )}
        </motion.div>
      </section>

      {/* Immersive Category Highlights */}
      <section className="max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 z-10">
        <div className="border-b border-zinc-700/80 pb-4 mb-8 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-1">
              Phân khúc thiết bị
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Danh Mục Nổi Bật</h2>
          </div>
          <Link href="/products" className="text-xs font-extrabold text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
            Xem tất cả catalog <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              name: "Audio & Music", 
              desc: "Tai nghe chống ồn chủ động, loa bluetooth cao cấp mang lại trải nghiệm âm thanh cực đỉnh.", 
              icon: Volume2, 
              tag: "Audio",
              hue: 250 
            },
            { 
              name: "Gaming Gear", 
              desc: "Bàn phím custom cơ, chuột công thái học lập trình siêu nhạy cho game thủ và coder chuyên nghiệp.", 
              icon: Gamepad2, 
              tag: "Gaming",
              hue: 330 
            },
            { 
              name: "Display & Mobile", 
              desc: "Điện thoại thông minh vỏ Titan, MacBook cao cấp, máy tính bảng OLED hiển thị sắc nét nhất.", 
              icon: Tv, 
              tag: "Display",
              hue: 200 
            }
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                whileHover={{ y: -6, border: "1px solid rgba(139, 92, 246, 0.5)", boxShadow: "0 0 30px rgba(139,92,246,0.15)" }}
                className="p-6 rounded-2xl border border-zinc-700/80 bg-zinc-900/50 backdrop-blur-md relative overflow-hidden group transition-all duration-300 shadow-xl cursor-pointer"
                onClick={() => router.push(`/products?category=${cat.tag}`)}
              >
                {/* Dynamically colored blur background circle on hover */}
                <div 
                  className="absolute top-0 right-0 -translate-y-4 translate-x-4 h-24 w-24 rounded-full blur-2xl transition duration-300 pointer-events-none"
                  style={{ backgroundColor: `hsla(${cat.hue}, 80%, 50%, 0.05)` }}
                />
                
                <div 
                  className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center mb-5 transition group-hover:scale-105"
                  style={{ color: `hsl(${cat.hue}, 90%, 65%)` }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors mb-2">
                  {cat.name}
                </h3>
                
                <p className="text-zinc-200 text-xs font-semibold leading-relaxed mb-6">
                  {cat.desc}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  Khám phá ngay
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-200" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Cyber Stats Banner Section */}
      <section className="w-full bg-[#18181c] border-y border-zinc-700/80 shadow-[0_0_30px_rgba(139,92,246,0.05)] py-12 my-12 z-10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "20,000+", label: "Sản phẩm chính hãng" },
            { val: "99.99%", label: "Giao dịch thành công" },
            { val: "< 150ms", label: "Độ trễ cổng API" },
            { val: "24/7/365", label: "Hỗ trợ khách hàng" }
          ].map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {stat.val}
              </div>
              <p className="text-xs text-zinc-200 font-black uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Bestsellers Showcase */}
      <section className="max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 z-10">
        <div className="border-b border-zinc-700/80 pb-4 mb-8">
          <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mb-1">
            Được đánh giá cao nhất
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">Thiết Bị Nổi Bật Bán Chạy</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-zinc-900/30 border border-zinc-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -6, border: "1px solid rgba(139, 92, 246, 0.4)", boxShadow: "0 0 35px rgba(139,92,246,0.15)" }}
                className="rounded-2xl border border-zinc-700 bg-[#17171c] overflow-hidden relative group transition-all duration-300 shadow-2xl"
              >
                {/* Visual image box */}
                <div className="h-48 bg-zinc-950 relative overflow-hidden border-b border-zinc-700/80 flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <ShoppingBag className="h-12 w-12 text-zinc-700" />
                  )}
                  
                  {/* Category Tag overlay */}
                  <span className="absolute top-4 left-4 bg-zinc-950/80 border border-zinc-700 px-3 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-purple-400">
                    {prod.category}
                  </span>
                </div>

                <div className="p-5.5 space-y-4">
                  {/* Rating + stock */}
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {prod.rating}
                    </span>
                    <span>Tồn: <b className="text-zinc-100">{prod.stock} chiếc</b></span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors truncate">
                    {prod.name}
                  </h3>

                  <p className="text-zinc-200 text-xs font-semibold line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="border-t border-zinc-700/80 my-3 pt-4 flex items-center justify-between">
                    <div className="text-base font-black text-purple-400 font-mono">
                      {formatVND(prod.price)}
                    </div>
                    
                    <button
                      onClick={() => handleQuickBuy(prod)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-extrabold transition shadow active:scale-95"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Cyber Security Assurance section */}
      <section className="max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 z-10">
        <div className="p-8 rounded-3xl border border-zinc-700 bg-gradient-to-r from-[#17171c] to-[#121215] shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 h-48 w-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3.5 max-w-xl text-left">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center text-purple-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white">Cam Kết Chất Lượng Đỉnh Cao</h3>
            <p className="text-zinc-200 text-xs font-semibold leading-relaxed">
              Mỗi sản phẩm mua tại Apex Portal đều được cam kết bảo hành 12-24 tháng 1 đổi 1 lỗi nhà sản xuất, hỗ trợ cài đặt cấu hình thông số kỹ thuật miễn phí trọn đời bởi đội ngũ chuyên gia công nghệ cao.
            </p>
          </div>

          <div className="space-y-2.5 w-full md:w-auto">
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-100">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <Check className="h-3 w-3" />
              </div>
              Bảo hành 24 tháng chính hãng
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-100">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <Check className="h-3 w-3" />
              </div>
              Hoàn tiền 100% nếu phát hiện giả mạo
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-100">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <Check className="h-3 w-3" />
              </div>
              Hỗ trợ giao nhanh trong 2h nội thành
            </div>
          </div>
        </div>
      </section>

      {/* Immersion Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-650">
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-white text-sm font-black tracking-tight">
                Apex Portal
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] font-semibold leading-relaxed">
              Hệ thống bán lẻ phụ kiện công nghệ và thiết bị phần cứng thông minh cao cấp, vận hành trên nền tảng Microservices tiên tiến nhất.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] text-zinc-450 font-black uppercase tracking-wider">Trang mua sắm</h4>
            <div className="flex flex-col gap-2.5 text-xs font-extrabold text-zinc-500">
              <Link href="/products" className="hover:text-purple-400 transition">Sản phẩm</Link>
              <Link href="/cart" className="hover:text-purple-400 transition">Giỏ hàng</Link>
              <Link href="/order-history" className="hover:text-purple-400 transition">Đơn hàng đã mua</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] text-zinc-450 font-black uppercase tracking-wider">Chính sách & An ninh</h4>
            <div className="flex flex-col gap-2.5 text-xs font-extrabold text-zinc-500">
              <a href="#" className="hover:text-purple-400 transition">Chính sách đổi trả 1-1</a>
              <a href="#" className="hover:text-purple-400 transition">Bảo mật thông tin khách hàng</a>
              <a href="#" className="hover:text-purple-400 transition">Liên hệ bộ phận kỹ thuật</a>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] text-zinc-450 font-black uppercase tracking-wider">Đăng ký nhận ưu đãi</h4>
            <p className="text-zinc-550 text-[11px] font-semibold leading-relaxed">
              Nhận email thông báo về đợt giảm giá mới nhất và sản phẩm công nghệ độc quyền.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-650 w-full outline-none focus:border-purple-500 font-semibold"
              />
              <button 
                onClick={() => toast.success("Cảm ơn bạn đã đăng ký bản tin ưu đãi!")}
                className="bg-zinc-100 hover:bg-white text-zinc-950 px-3 py-2 rounded-xl text-xs font-black transition active:scale-95"
              >
                Gửi
              </button>
            </div>
          </div>

        </div>

        {/* Footer bottom lines */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 border-t border-zinc-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-zinc-600 text-[10px] font-bold">
            © 2026 Apex Systems Inc. All rights reserved.
          </div>
          <div className="text-zinc-600 text-[10px] font-bold">
            Vận hành bảo mật trên giao thức SSL 256-bit
          </div>
        </div>
      </footer>

    </div>
  );
}

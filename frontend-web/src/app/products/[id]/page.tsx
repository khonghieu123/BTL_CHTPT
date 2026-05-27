"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, Product, ProductVariant } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ShoppingCart, Star, Sparkles, 
  Truck, ArrowRight, ShieldCheck, Laptop, BadgeInfo, CheckCircle, Headphones, Mouse, Keyboard, Monitor, Speaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Mapping dynamic Lucide icons for high-end premium preview plates
const getProductIcon = (name: string, category: string) => {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  
  if (n.includes("sony") || n.includes("tai nghe") || (c === "audio" && n.includes("wh-1000xm5"))) {
    return Headphones;
  }
  if (n.includes("jbl") || n.includes("loa") || c === "audio") {
    return Speaker;
  }
  if (n.includes("logitech") || n.includes("chuột") || (c === "gaming" && n.includes("superlight"))) {
    return Mouse;
  }
  if (n.includes("keychron") || n.includes("bàn phím") || c === "gaming") {
    return Keyboard;
  }
  if (n.includes("dell") || n.includes("màn hình") || c === "display") {
    return Monitor;
  }
  return Monitor;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, addToCart } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseQty, setPurchaseQty] = useState(1);

  // Variant States
  const [selectedCapacity, setSelectedCapacity] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");



  // Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await apiCall("get", `/products/${id}`);
        
        // Normalize database entity to match frontend schema
        const normalizedProduct = data ? {
          ...data,
          price: data.price ?? 0,
          stock: data.stock ?? data.stockQuantity ?? 0,
          category: data.category ?? "Gaming",
          description: data.description ?? "Trải nghiệm dòng sản phẩm công nghệ cao cấp thế hệ mới tại Apex Cyber Store.",
          rating: data.rating ?? 4.8,
          reviewsCount: data.reviewsCount ?? 64,
          imageHue: data.imageHue ?? (data.id * 40) % 360,
          specs: data.specs ?? {
            "Thương hiệu": "Chính hãng",
            "Bảo hành": "12 tháng",
            "Tình trạng": "Mới 100%",
            "Kết nối": "Tích hợp đa nền tảng"
          },
          imageUrl: data.imageUrl && data.imageUrl.trim() !== "" 
            ? data.imageUrl 
            : "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop",
          variants: data.variants || []
        } : null;

        setProduct(normalizedProduct);

        // Auto select first variant options
        if (normalizedProduct && normalizedProduct.variants && normalizedProduct.variants.length > 0) {
          const capacities = Array.from(new Set(normalizedProduct.variants.map((v: ProductVariant) => v.capacity).filter(Boolean)));
          const colors = Array.from(new Set(normalizedProduct.variants.map((v: ProductVariant) => v.color).filter(Boolean)));
          
          if (capacities.length > 0) setSelectedCapacity(capacities[0] as string);
          if (colors.length > 0) setSelectedColor(colors[0] as string);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        toast.error("Không tìm thấy sản phẩm hoặc lỗi kết nối.");
        router.push("/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, router]);

  // Compute Active Variant Details
  const getActiveVariant = (): ProductVariant | undefined => {
    if (!product || !product.variants || product.variants.length === 0) return undefined;
    return product.variants.find(v => {
      const matchCapacity = !v.capacity || v.capacity === selectedCapacity;
      const matchColor = !v.color || v.color === selectedColor;
      return matchCapacity && matchColor;
    });
  };

  const activeVariant = getActiveVariant();
  const displayPrice = product ? product.price + (activeVariant ? activeVariant.priceOffset : 0) : 0;
  const displayStock = activeVariant ? activeVariant.stock : (product ? product.stock : 0);
  const isLowStock = displayStock <= 5;

  // Increment/Decrement quantity handlers
  const handleQtyChange = (val: number) => {
    if (!product) return;
    const newQty = purchaseQty + val;
    if (newQty < 1) return;
    if (newQty > displayStock) {
      toast.warning(`Chỉ còn ${displayStock} sản phẩm trong kho!`);
      return;
    }
    setPurchaseQty(newQty);
  };

  // Get full variant suffix name
  const getProductFullName = () => {
    if (!product) return "";
    let suffix = "";
    if (selectedCapacity || selectedColor) {
      suffix = ` (${[selectedCapacity, selectedColor].filter(Boolean).join(" - ")})`;
    }
    return `${product.name}${suffix}`;
  };

  // Add to cart with specific quantity and variant settings
  const handleAddToCartWithQty = () => {
    if (!product) return;
    if (displayStock === 0) {
      toast.error("Sản phẩm phiên bản này hiện đã hết hàng!");
      return;
    }
    const fullName = getProductFullName();
    for (let i = 0; i < purchaseQty; i++) {
      addToCart({ id: product.id, name: fullName, price: displayPrice });
    }
    toast.success(`Đã thêm ${purchaseQty} sản phẩm ${fullName} vào giỏ hàng`);
  };

  // Direct checkout
  const handleBuyNow = () => {
    if (!product) return;
    if (displayStock === 0) {
      toast.error("Sản phẩm phiên bản này hiện đã hết hàng!");
      return;
    }
    const fullName = getProductFullName();
    addToCart({ id: product.id, name: fullName, price: displayPrice });
    router.push("/cart");
  };

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 relative">
        <Navbar />
        {/* Ambient background blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
        
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-6 w-24 bg-zinc-800" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <Skeleton className="md:col-span-5 h-[400px] w-full rounded-2xl bg-zinc-800" />
            <div className="md:col-span-7 space-y-4">
              <Skeleton className="h-8 w-2/3 bg-zinc-800" />
              <Skeleton className="h-4 w-1/3 bg-zinc-800" />
              <Skeleton className="h-20 w-full bg-zinc-800" />
              <Skeleton className="h-10 w-1/4 bg-zinc-800" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return null;

  const DynamicIcon = getProductIcon(product.name, product.category);

  // Group unique capacities and colors for selection UI
  const availableCapacities = product.variants 
    ? Array.from(new Set(product.variants.map(v => v.capacity).filter(Boolean))) as string[]
    : [];
  const availableColors = product.variants 
    ? Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[]
    : [];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber Grid Background Leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 z-10">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="text-zinc-300 hover:text-white p-0 hover:bg-transparent flex items-center gap-2 text-sm font-black uppercase tracking-wider transition"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Quay lại catalog
          </Button>
        </div>

        {/* Dynamic Detail Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Premium Interactive Product Render */}
          <div className="md:col-span-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square w-full rounded-2xl border border-zinc-800 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black flex flex-col items-center justify-center overflow-hidden shadow-2xl"
            >
              {/* Dynamic glow in container */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_75%)] pointer-events-none" />
              
              {/* Large premium floating tech icon centered */}
              <div className="relative flex flex-col items-center justify-center z-10">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-purple-900/40 to-zinc-800/80 border border-purple-500/20 flex items-center justify-center shadow-2xl shadow-purple-950/45">
                  <DynamicIcon className="h-14 w-14 text-purple-400" />
                </div>
              </div>

              {product.imageUrl && (
                <div className="absolute inset-0 opacity-15 hover:opacity-25 transition-opacity duration-300">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
              )}

              <div className="absolute bottom-6 flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 px-4.5 py-2 rounded-full text-sm font-black text-zinc-200 shadow-xl">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span>{product.rating} / 5.0 ({product.reviewsCount} đánh giá thực tế)</span>
              </div>
            </motion.div>

            {/* Guarantees panel */}
            <Card className="border-zinc-800 bg-[#131316]/50 backdrop-blur-md shadow-xl">
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm font-black text-zinc-300">
                  <ShieldCheck className="h-4.5 w-4.5 text-purple-400" />
                  <span>Bảo hành 24 tháng</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-black text-zinc-300">
                  <Truck className="h-4.5 w-4.5 text-purple-400" />
                  <span>Giao nhanh 2h toàn quốc</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Spec Sheets & Shopping Cockpit */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Core Header information */}
            <div className="space-y-3.5 border-b border-zinc-800/80 pb-6">
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs font-black text-zinc-300 uppercase tracking-widest">
                Phân khúc: {product.category}
              </div>
              
              <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {/* Stock tag */}
                <span className={`text-xs font-black px-3.5 py-1 rounded-full border ${
                  isLowStock 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : "bg-zinc-800/60 text-zinc-300 border-zinc-700/50"
                }`}>
                  {displayStock === 0 
                    ? "⚠️ Hết hàng phiên bản này" 
                    : isLowStock 
                      ? `⚠️ Cực hiếm - Chỉ còn ${displayStock} trong kho` 
                      : `✔️ Sẵn hàng tại Apex Store (${displayStock} chiếc)`}
                </span>
                
                <span className="text-xs font-extrabold text-zinc-400 font-mono">ID: APX-00{product.id}</span>
              </div>
            </div>

            {/* PRODUCT VARIANTS SELECTION UI */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 border-b border-zinc-800/80 pb-6">
                <span className="text-xs text-zinc-400 font-black uppercase tracking-wider block">Lựa chọn phiên bản thiết bị</span>
                
                {/* Capacity Selectors */}
                {availableCapacities.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Cấu hình / Dung lượng:</label>
                    <div className="flex flex-wrap gap-2.5">
                      {availableCapacities.map((cap) => (
                        <button
                          key={cap}
                          onClick={() => setSelectedCapacity(cap)}
                          className={`px-4.5 py-2.5 rounded-xl text-xs font-black border transition-all duration-200 ${
                            selectedCapacity === cap
                              ? "bg-purple-950/20 border-purple-500 text-purple-400 shadow-md shadow-purple-950/30"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                          }`}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableColors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Màu sắc Titanium:</label>
                    <div className="flex flex-wrap gap-2.5">
                      {availableColors.map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-4.5 py-2.5 rounded-xl text-xs font-black border transition-all duration-200 ${
                            selectedColor === col
                              ? "bg-purple-950/20 border-purple-500 text-purple-400 shadow-md shadow-purple-950/30"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Section */}
            <div className="bg-[#131316]/50 border border-zinc-800/80 p-5 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-black uppercase tracking-wider">Giá bán ưu đãi (Đã VAT)</span>
                <div className="text-3xl font-black text-purple-400 font-mono">
                  {formatVND(displayPrice)}
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <span className="text-xs text-zinc-400 font-black uppercase tracking-wider block">Vận chuyển</span>
                <span className="text-sm font-black text-purple-400 flex items-center gap-1.5 mt-1 justify-end">
                  <CheckCircle className="h-4 w-4 text-purple-400" /> Miễn phí vận chuyển
                </span>
              </div>
            </div>

            {/* Core tech description */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider">Giới thiệu sản phẩm</h3>
              <p className="text-base text-zinc-300 leading-relaxed font-semibold">
                {product.description}
              </p>
            </div>

            {/* Specifications matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider">Thông số kỹ thuật chi tiết</h3>
              <div className="border border-zinc-800/80 rounded-2xl overflow-hidden text-sm bg-[#131316]/20 shadow-xl">
                {Object.entries(product.specs || {}).map(([key, val], idx) => (
                  <div 
                    key={key} 
                    className={`grid grid-cols-3 p-3.5 ${idx % 2 === 0 ? "bg-zinc-950/40" : "bg-transparent"} border-b border-zinc-850 last:border-0`}
                  >
                    <div className="font-black text-zinc-400 col-span-1">{key}</div>
                    <div className="text-zinc-200 col-span-2 pl-4 font-bold">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Cockpit */}
            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-black text-zinc-400 uppercase tracking-wider">Số lượng đặt:</span>
                
                {/* Custom input toggle */}
                <div className="flex items-center gap-3.5 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    className="text-zinc-400 hover:text-white px-2 font-black text-xl transition active:scale-90"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-white w-6 text-center">
                    {purchaseQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    className="text-zinc-400 hover:text-white px-2 font-black text-xl transition active:scale-90"
                  >
                    +
                  </button>
                </div>

                {/* Micro total price summary */}
                <div className="text-right ml-auto">
                  <span className="text-xs text-zinc-400 font-black uppercase tracking-wider block">Thành tiền tạm tính</span>
                  <span className="text-xl font-black text-purple-400 font-mono">{formatVND(displayPrice * purchaseQty)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  onClick={handleAddToCartWithQty}
                  disabled={displayStock === 0}
                  className="bg-[#131316] hover:bg-[#1b1b20] border border-zinc-800 text-zinc-300 hover:text-white font-extrabold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-40 text-base"
                >
                  <ShoppingCart className="h-5.5 w-5.5 text-purple-400" />
                  <span>Thêm vào giỏ</span>
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={displayStock === 0}
                  className="bg-zinc-100 hover:bg-white text-zinc-900 font-extrabold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2.5 active:scale-95 shadow-md shadow-zinc-950/20 text-base"
                >
                  <span>Mua ngay</span>
                  <ArrowRight className="h-5.5 w-5.5" />
                </Button>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

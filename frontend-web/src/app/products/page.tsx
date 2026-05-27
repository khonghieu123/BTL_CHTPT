"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, Product } from "@/lib/api";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Star, Tag, Sparkles, Search, SlidersHorizontal, 
  Eye, ArrowUpDown, X, Headphones, Mouse, Keyboard, Monitor, Speaker, Loader2,
  Filter, Check, DollarSign, RefreshCw, Layers, Box
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Available Brands derived dynamically or hardcoded for elite UI
const TECH_BRANDS = ["Apple", "Samsung", "Dell", "ASUS", "Sony", "Google", "Keychron", "Logitech", "Kindle"];

export default function ProductsPage() {
  const router = useRouter();
  const { token, addToCart } = useApp();
  
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Core Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // ADVANCED SEARCH & FILTERS STATES
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000000); // 100M VND default max
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]); // "M3", "RTX", "OLED" etc.
  
  // Loading state per product button
  const [addingProductIds, setAddingProductIds] = useState<Record<number, boolean>>({});



  // Fetch product list
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await apiCall("get", "/products");
        
        // Normalise backend field names to frontend schema
        const normalizedData = (data || []).map((p: any) => ({
          ...p,
          price: typeof p.price === "number" ? p.price : parseFloat(p.price) || 0,
          stock: p.stockQuantity ?? p.stock ?? 0,
          category: p.category ?? "General",
          description: p.description?.trim() || "Sản phẩm công nghệ cao cấp.",
          rating: p.rating ?? 4.8,
          reviewsCount: p.reviewsCount ?? 0,
          imageHue: p.imageHue ?? (p.id * 40) % 360,
          specs: p.specs ?? {},
          imageUrl: p.imageUrl?.trim() ||
            "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop",
        }));
        
        setProducts(normalizedData);
        setFilteredProducts(normalizedData);

      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Live Reactive Filter & Sort logic
  useEffect(() => {
    let result = [...products];

    // 1. Text Keyword Search (matches Name, Category, Description)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory !== "All") {
      result = result.filter(p => (p.category ?? "") === selectedCategory);
    }

    // 3. Brand filter (checkboxes)
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        const productName = p.name.toLowerCase();
        return selectedBrands.some(brand => {
          const b = brand.toLowerCase();
          // Check if brand is Apple and product matches Apple product types
          if (b === "apple") {
            const isAppleProduct = 
              productName.includes("apple") || 
              productName.includes("macbook") || 
              productName.includes("iphone") || 
              productName.includes("ipad") || 
              productName.includes("airpods");
            if (isAppleProduct) return true;
          }
          // Direct substring match
          if (productName.includes(b)) return true;
          // Split-word match as a fallback
          const firstWord = p.name.split(" ")[0].toLowerCase();
          return firstWord === b;
        });
      });
    }

    // 4. Price range filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 5. In-stock availability filter
    if (onlyInStock) {
      result = result.filter(p => (p.stock ?? 0) > 0);
    }

    // 6. Highlighted Specs filters (e.g. M3, Core i9, S-Pen, OLED)
    if (selectedSpecs.length > 0) {
      result = result.filter(p => {
        const fullContent = (p.name + " " + (p.description ?? "") + " " + JSON.stringify(p.specs ?? {})).toLowerCase();
        return selectedSpecs.some(spec => fullContent.includes(spec.toLowerCase()));
      });
    }

    // 7. Sort logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, selectedBrands, minPrice, maxPrice, onlyInStock, selectedSpecs, sortBy, products]);

  // Dynamic list of unique categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category ?? "General")))];

  // Currency Formatter
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Add to Cart handler with spinner simulation
  const handleAddToCart = async (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid card click navigation trigger
    
    setAddingProductIds(prev => ({ ...prev, [prod.id]: true }));
    
    // Premium feedback spinner delay
    await new Promise(resolve => setTimeout(resolve, 650));
    
    addToCart({ id: prod.id, name: prod.name, price: prod.price });
    setAddingProductIds(prev => ({ ...prev, [prod.id]: false }));
    toast.success(`Đã thêm ${prod.name} vào giỏ hàng thành công!`);
  };

  // Brand toggle handler
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Spec toggle handler
  const handleSpecToggle = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(100000000);
    setOnlyInStock(false);
    setSelectedSpecs([]);
    setSortBy("default");
    toast.info("Đã đặt lại toàn bộ bộ lọc về mặc định");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber Grid Background Leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Futuristic Ambient Spots */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-purple-500/5 opacity-40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-cyan-500/5 opacity-30 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 z-10">
        
        {/* Futuristic Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-xl p-6 md:p-8 overflow-hidden shadow-2xl"
        >
          {/* Subtle neon glow overlay */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-widest mb-1.5">
                <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                Apex Premium Hub
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Khám Phá Công Nghệ Mới
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed font-medium">
                Sử dụng các bộ lọc nâng cao bên dưới để tìm kiếm cấu hình RAM, Chipset, thương hiệu và khoảng giá sản phẩm phù hợp.
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-xs font-black bg-zinc-900/60 border border-zinc-800/50 text-zinc-400 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                Bộ lọc tìm kiếm nâng cao Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* TWO COLUMN GRID LAYOUT (Left Sidebar Filter - Right Product Catalog) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: ADVANCED SEARCH & FILTERS PANEL */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            <Card className="border-zinc-700/80 bg-[#17171c] shadow-[0_0_25px_rgba(139,92,246,0.1)] hover:shadow-[0_0_35px_rgba(139,92,246,0.15)] transition-all duration-300 p-5 rounded-2xl space-y-6">
              
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <Filter className="h-4 w-4 text-purple-400 animate-pulse" />
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-black uppercase flex items-center gap-1 transition"
                  title="Đặt lại tất cả bộ lọc"
                >
                  <RefreshCw className="h-3 w-3" /> Đặt lại
                </button>
              </div>

              {/* Keyword text search */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-200 uppercase tracking-wider block">Từ khóa tìm kiếm:</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Tên máy, loa, chuột..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-xs h-10 font-bold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-200 uppercase tracking-wider block">Dòng sản phẩm:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-black text-zinc-100 focus:border-purple-500 py-2.5 px-3 outline-none cursor-pointer hover:border-zinc-650 hover:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "Tất cả danh mục" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand multi-select checkboxes */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-zinc-200 uppercase tracking-wider block">Thương hiệu:</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {TECH_BRANDS.map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleBrandToggle(brand)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center justify-between transition-all duration-200 ${
                          isSelected
                            ? "bg-purple-950/40 border-purple-500 text-purple-400 shadow-md"
                            : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span>{brand}</span>
                        {isSelected && <Check className="h-3 w-3 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Fields */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-zinc-200 uppercase tracking-wider block">Mức giá chênh lệch:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-extrabold">Từ:</span>
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="border-zinc-700 bg-zinc-900 text-white rounded-xl text-xs font-mono h-9 px-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-extrabold">Đến:</span>
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="border-zinc-700 bg-zinc-900 text-white rounded-xl text-xs font-mono h-9 px-2"
                    />
                  </div>
                </div>
                
                {/* Visual Quick Price presets */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {[
                    { label: "< 5Tr", min: 0, max: 5000000 },
                    { label: "5Tr - 15Tr", min: 5000000, max: 15000000 },
                    { label: "15Tr - 30Tr", min: 15000000, max: 30000000 },
                    { label: "> 30Tr", min: 30000000, max: 100000000 }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setMinPrice(p.min);
                        setMaxPrice(p.max);
                      }}
                      className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 transition-all duration-200"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec Tag Multi-select checkboxes */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Thông số / Chipset / RAM:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: "M3", label: "Apple M3" },
                    { val: "M2", label: "Apple M2" },
                    { val: "A17", label: "A17 Pro" },
                    { val: "Core i9", label: "Core i9" },
                    { val: "RTX", label: "NVIDIA RTX" },
                    { val: "OLED", label: "OLED Panel" },
                    { val: "32GB", label: "32GB RAM" },
                    { val: "18GB", label: "18GB RAM" },
                    { val: "ANC", label: "Chống ồn ANC" }
                  ].map((spec) => {
                    const isSelected = selectedSpecs.includes(spec.val);
                    return (
                      <button
                        key={spec.val}
                        type="button"
                        onClick={() => handleSpecToggle(spec.val)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-black transition-all duration-200 ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                            : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white hover:border-zinc-500"
                        }`}
                      >
                        {spec.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability Filter Checkbox */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-850/80">
                <input
                  type="checkbox"
                  id="stockCheck"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-zinc-850 text-purple-650 bg-zinc-950 focus:ring-purple-500 h-4.5 w-4.5 cursor-pointer accent-purple-600"
                />
                <label htmlFor="stockCheck" className="text-xs text-zinc-300 font-extrabold cursor-pointer select-none">
                  Chỉ hiện sản phẩm còn hàng
                </label>
              </div>

            </Card>
          </div>

          {/* RIGHT COLUMN: CATALOG PRODUCT GRID & SORT CONTROLLER */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Sort Controller bar */}
            <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl p-4 shadow-xl rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-black text-zinc-400">
                Tìm thấy <b className="text-purple-400 font-mono text-sm">{filteredProducts.length}</b> sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <ArrowUpDown className="h-4.5 w-4.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black text-zinc-100 focus:border-purple-500 py-2 px-3 outline-none cursor-pointer hover:border-zinc-700 hover:text-white"
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A - Z</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </Card>

            {/* Catalog Grid Area */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((id) => (
                  <Card key={id} className="border-zinc-850 bg-zinc-900/30 p-4 space-y-4 rounded-2xl shadow-xl">
                    <Skeleton className="h-48 w-full rounded-xl bg-zinc-800/40" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-2/3 bg-zinc-800/40" />
                      <Skeleton className="h-4 w-1/3 bg-zinc-800/40" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-6 w-1/4 bg-zinc-800/40" />
                      <Skeleton className="h-9 w-1/3 bg-zinc-800/40" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md rounded-2xl max-w-lg mx-auto shadow-2xl">
                <SlidersHorizontal className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
                <h4 className="text-base font-black text-white mb-1">Không tìm thấy sản phẩm phù hợp</h4>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">
                  Hãy thử mở rộng khoảng giá, thay đổi từ khóa hoặc bấm reset toàn bộ bộ lọc để bắt đầu lại.
                </p>
                <Button
                  onClick={handleResetFilters}
                  className="mt-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm py-2.5 px-5 shadow"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProducts.map((prod) => {
                  const DynamicIcon = getProductIcon(prod.name, prod.category ?? "");
                  const isLowStock = (prod.stock ?? 0) <= 5;
                  const isAdding = addingProductIds[prod.id] || false;
                  
                  return (
                    <motion.div key={prod.id} variants={cardVariants}>
                      <div 
                        className="group relative overflow-hidden border border-zinc-800 bg-[#131316] hover:border-purple-500/85 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer rounded-2xl shadow-xl"
                        onClick={() => router.push(`/products/${prod.id}`)}
                      >
                        
                        {/* Highly Stylized Gradient Mockup Image Container */}
                        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black border-b border-zinc-850 flex items-center justify-center">
                          
                          {/* Interactive Subtle Ambient Grid Underneath Mockup */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_75%)]" />
                          
                          {/* Dynamic product image taking full stage if present */}
                          {prod.imageUrl ? (
                            <div className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105">
                              <img 
                                src={prod.imageUrl} 
                                alt={prod.name} 
                                className="h-full w-full object-cover" 
                              />
                              {/* Premium subtle dark vignette so the floating badges remain highly visible */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
                            </div>
                          ) : (
                            /* Floating fallback icon ONLY if there is no image */
                            <div className="relative flex flex-col items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110">
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-950/80 to-zinc-900/90 border border-purple-550/30 flex items-center justify-center shadow-lg shadow-purple-950/40 group-hover:border-purple-500/50 transition duration-300">
                                <DynamicIcon className="h-8 w-8 text-purple-400 group-hover:text-purple-355 transition duration-300" />
                              </div>
                            </div>
                          )}
                           
                          {/* Floating Rating Star Badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 px-2.5 py-0.5 rounded-full text-xs font-black text-zinc-300 shadow-lg">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{prod.rating ?? 0}</span>
                          </div>
                           
                          {/* Refined Pill Badges for Stock Level (High vs Low Stock UI) */}
                          <span className={`absolute top-3 right-3 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-lg backdrop-blur-md ${
                            (prod.stock ?? 0) === 0
                              ? "bg-zinc-950 text-zinc-550 border-zinc-900"
                              : isLowStock 
                                ? "bg-red-500/20 text-red-400 border-red-500/35 animate-pulse font-black" 
                                : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
                          }`}>
                            {(prod.stock ?? 0) === 0 ? "Hết hàng" : isLowStock ? `Chỉ còn ${prod.stock}` : `Stock: ${prod.stock}`}
                          </span>

                          {/* Hover action banner overlay */}
                          <div className="absolute inset-0 bg-zinc-950/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] z-20">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/products/${prod.id}`);
                              }}
                              className="border-zinc-800 bg-zinc-900 hover:bg-white text-zinc-300 hover:text-zinc-900 text-sm font-bold flex items-center gap-1.5 shadow-xl rounded-xl"
                            >
                              <Eye className="h-4.5 w-4.5" />
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>

                        {/* Metadata Header */}
                        <div className="p-5 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors duration-200 line-clamp-1">
                              {prod.name}
                            </h3>
                          </div>
                          <div className="text-purple-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                            <Tag className="h-4 w-4 text-purple-500/85" />
                            <span>Danh mục: {prod.category ?? "General"}</span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <div className="px-5 pt-0 pb-4 flex-1">
                          <p className="text-sm text-zinc-250 line-clamp-2 leading-relaxed font-semibold">
                            {prod.description}
                          </p>
                        </div>

                        {/* Action Footbar with deep high-contrast bg-zinc-950/50 */}
                        <div 
                          className="p-5 pt-4 border-t border-zinc-850/80 mt-auto flex items-center justify-between gap-4 bg-zinc-950/50 rounded-b-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col min-w-[100px]">
                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Giá bán lẻ</span>
                            <span className="text-base font-black text-purple-400 font-mono">
                              {formatVND(prod.price)}
                            </span>
                          </div>

                          <Button
                            onClick={(e) => handleAddToCart(prod, e)}
                            disabled={(prod.stock ?? 0) === 0 || isAdding}
                            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all duration-200 rounded-xl py-2.5 flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
                          >
                            {isAdding ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                                <span className="text-sm font-black">Đang xử lý</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4.5 w-4.5" />
                                <span className="text-sm font-black">Thêm vào giỏ</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

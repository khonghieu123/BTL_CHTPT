"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit2, ShieldAlert, Search, RefreshCw, X, ArrowLeft, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminProductsPage() {
  const router = useRouter();
  const { token, role } = useApp();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product forms
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Audio");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Access Control Guard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!storedToken) {
      router.push("/");
      return;
    }

    if (role === "ADMIN" || storedRole === "ADMIN") {
      setIsAuthorized(true);
    } else if (role !== null) {
      setIsAuthorized(false);
    }
  }, [role, router]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall("get", "/products");
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      toast.error("Không nạp được danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadProducts();
    }
  }, [isAuthorized]);

  // Live filter search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, products]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setStock("");
    setCategory("Audio");
    setDesc("");
    setImgUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setCategory(prod.category);
    setDesc(prod.description);
    setImgUrl(prod.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || !stock || !desc.trim()) {
      toast.warning("Vui lòng nhập đầy đủ các trường!");
      return;
    }

    const priceNum = parseInt(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Giá bán phải là số dương hợp lệ");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Số lượng kho không hợp lệ");
      return;
    }

    const payload = {
      name,
      price: priceNum,
      stock: stockNum,
      category,
      description: desc,
      imageUrl: imgUrl.trim(),
      ...(editingProduct ? { id: editingProduct.id } : {})
    };

    try {
      if (editingProduct) {
        await apiCall("put", "/products", payload);
        toast.success(`Đã cập nhật sản phẩm: ${name}`);
      } else {
        await apiCall("post", "/products", payload);
        toast.success(`Đã tạo sản phẩm mới thành công!`);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error("Lỗi khi lưu trữ thông tin sản phẩm.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) return;
    try {
      await apiCall("delete", `/products/${id}`);
      toast.success("Đã xóa sản phẩm thành công!");
      loadProducts();
    } catch (err) {
      toast.error("Lỗi khi xóa sản phẩm.");
    }
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (isAuthorized === false) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 font-sans text-zinc-100">
        <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 opacity-50 blur-[100px] pointer-events-none" />
        <Card className="max-w-md w-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="mx-auto h-16 w-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-400 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Từ chối truy cập</h2>
          <p className="text-zinc-400 text-xs font-semibold leading-relaxed">Tài khoản này không có quyền quản trị sản phẩm.</p>
          <Button onClick={() => router.push("/products")} className="w-full bg-zinc-100 text-zinc-900 border-0 font-bold rounded-xl text-xs py-2">
            Quay lại Cửa Hàng
          </Button>
        </Card>
      </div>
    );
  }

  if (isAuthorized === null) return null;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber Grid Background Leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition">
            <ArrowLeft className="h-4 w-4" />
            Bảng Điều Khiển Admin
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/admin/users" className="px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white shadow-lg transition">
              Quản lý Tài Khoản
            </Link>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-purple-400" />
              Hệ thống kho hàng Apex
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Quản Lý Sản Phẩm
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-semibold leading-relaxed">
              Thêm mới hàng hóa kỹ thuật số, tinh chỉnh mô tả, quản lý mức độ tồn kho và giá bán lẻ.
            </p>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-xl py-2.5 px-4 flex items-center gap-1.5 shadow active:scale-95 transition-all duration-300 animate-pulse"
          >
            <Plus className="h-4 w-4" />
            Thêm Sản Phẩm Mới
          </Button>
        </div>

        {/* Filters Top Bar */}
        <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 rounded-xl text-xs focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
              Hiển thị {filteredProducts.length} trên tổng số {products.length} sản phẩm
            </span>
          </div>
        </Card>

        {/* Data Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full bg-zinc-900/30 rounded-xl border border-zinc-800" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md p-12 text-center max-w-md mx-auto shadow-xl rounded-2xl">
            <ShoppingBag className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Không tìm thấy sản phẩm</h4>
            <p className="text-xs text-zinc-400">Thử gõ một từ khóa tìm kiếm khác.</p>
          </Card>
        ) : (
          <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-zinc-950/80 border-zinc-800">
                <TableRow className="border-zinc-850 hover:bg-transparent">
                  <TableHead className="w-[80px] font-extrabold text-zinc-400 text-xs text-center uppercase tracking-wider py-4">Ảnh</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">Tên Thiết Bị</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">Phân Loại</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider text-right">Đơn Giá</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider text-center w-[120px]">Tồn Kho</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider text-center w-[120px]">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((prod) => (
                  <TableRow key={prod.id} className="border-zinc-850/50 hover:bg-zinc-900/30 transition duration-150">
                    <TableCell className="p-3 text-center">
                      <div className="mx-auto h-10 w-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-inner">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 text-zinc-550" />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="font-extrabold text-white text-xs">{prod.name}</TableCell>
                    
                    <TableCell className="text-xs text-zinc-450 font-semibold">{prod.category}</TableCell>
                    
                    <TableCell className="text-right text-xs font-black text-purple-400">{formatVND(prod.price)}</TableCell>
                    
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        prod.stock <= 5 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse font-black" 
                          : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/50"
                      }`}>
                        {prod.stock} chiếc
                      </span>
                    </TableCell>
                    
                    <TableCell className="py-2.5">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 transition duration-150 active:scale-95"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/20 text-zinc-350 hover:text-red-400 border border-zinc-800 hover:border-red-900/30 transition duration-150 active:scale-95"
                          title="Xóa bỏ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg border border-zinc-800 bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4 p-6">
                  <div>
                    <CardTitle className="text-sm font-extrabold text-white">
                      {editingProduct ? `Cập Nhật: ${editingProduct.name}` : "Thêm Hàng Hóa Mới"}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-[10px] font-medium mt-0.5">
                      Nhập thông tin sản phẩm tương thích kho lưu trữ.
                    </CardDescription>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-450 hover:text-white border border-zinc-800">
                    <X className="h-4 w-4" />
                  </button>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Tên sản phẩm</label>
                      <Input
                        type="text"
                        placeholder="e.g. Tai nghe Sony WH-1000XM5"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-zinc-800 bg-zinc-950/85 text-white text-xs rounded-xl focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Đơn giá (VND)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 8490000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="border-zinc-800 bg-zinc-950/85 text-white text-xs rounded-xl focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Số lượng nhập</label>
                        <Input
                          type="number"
                          placeholder="e.g. 15"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="border-zinc-800 bg-zinc-950/85 text-white text-xs rounded-xl focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Phân loại danh mục</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 py-2.5 px-3 focus:border-purple-500 outline-none"
                      >
                        <option value="Audio">Audio (Tai nghe, Loa)</option>
                        <option value="Gaming">Gaming (Chuột, Phím)</option>
                        <option value="Display">Display (Màn hình)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">URL hình ảnh sản phẩm (Unsplash)</label>
                      <Input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        className="border-zinc-800 bg-zinc-950/85 text-white text-xs rounded-xl font-mono focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Mô tả tóm tắt tính năng</label>
                      <textarea
                        rows={3}
                        placeholder="Giới thiệu tính năng nổi trội..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full bg-zinc-950/85 border border-zinc-800 rounded-xl text-xs font-medium text-white focus:border-purple-500 p-2.5 outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 mt-4">
                      <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded-xl text-xs transition">
                        Đóng lại
                      </Button>
                      <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition">
                        Lưu Thay Đổi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, Product, User, Order } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  ShieldCheck, LayoutDashboard, ShoppingBag, Users, 
  DollarSign, FileText, ShieldAlert, RefreshCw, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from "recharts";
import Link from "next/link";

const REVENUE_CHART_DATA = [
  { name: "Thứ 2", Sales: 2400000 },
  { name: "Thứ 3", Sales: 4800000 },
  { name: "Thứ 4", Sales: 3600000 },
  { name: "Thứ 5", Sales: 5800000 },
  { name: "Thứ 6", Sales: 8500000 },
  { name: "Thứ 7", Sales: 11000000 },
  { name: "Chủ nhật", Sales: 15850000 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { token, role } = useApp();
  
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const prodData = await apiCall("get", "/products");
      const userData = await apiCall("get", "/auth/users");
      const orderData = await apiCall("get", "/orders/all");
      
      setProducts(prodData);
      setUsers(userData);
      
      // Adapt backend JPA Order (id, totalAmount, userId) to frontend state representation
      const mappedOrders = await Promise.all((orderData || []).map(async (ord: any) => {
        let customerEmail = "";
        // Always try to resolve email via userId
        if (ord.userId) {
          try {
            const userDetail = await apiCall("get", `/auth/users/${ord.userId}`);
            if (userDetail && userDetail.email) {
              customerEmail = userDetail.email;
            } else {
              console.warn(`User ${ord.userId} has no email field`);
            }
          } catch (e) {
            console.warn(`Could not resolve email for user ${ord.userId}`);
          }
        }
        // Fallback to a placeholder if still empty
        if (!customerEmail) {
          customerEmail = `user${ord.userId || ""}@example.com`;
        }
        
        return {
          id: ord.id ? ord.id.toString() : `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: ord.userId || 0,
          customerEmail,
          total: ord.totalAmount !== undefined ? ord.totalAmount : (ord.total || 0),
          status: ord.status || "PENDING",
          createdAt: ord.createdAt || new Date().toLocaleDateString("vi-VN"),
          items: ord.items || []
        };
      }));

      mappedOrders.sort((a: any, b: any) => {
        const numA = parseInt(a.id.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.id.replace(/\D/g, "")) || 0;
        return numB - numA;
      });
      setOrders(mappedOrders);
    } catch (err) {
      toast.error("Không nạp được dữ liệu quản trị.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadAdminData();
    }
  }, [isAuthorized]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiCall("put", `/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Cập nhật đơn hàng ${orderId} thành: ${newStatus}`);
      loadAdminData();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái đơn hàng");
    }
  };

  const handleViewOrderDetail = async (ord: any) => {
    setSelectedOrder(ord);
    setCustomerDetail(null);
    if (ord.customerId) {
      setIsDetailLoading(true);
      try {
        const userDetail = await apiCall("get", `/auth/users/${ord.customerId}`);
        setCustomerDetail(userDetail);
      } catch (err) {
        console.error("Could not fetch customer details", err);
      } finally {
        setIsDetailLoading(false);
      }
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
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl text-center space-y-6 shadow-2xl"
        >
          <div className="mx-auto h-16 w-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-400 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Từ chối truy cập</h2>
            <p className="text-zinc-400 text-xs font-semibold leading-relaxed font-sans">
              Tài khoản hiện tại của bạn không có đặc quyền quản trị viên. Vui lòng quay trở lại màn hình chính của cửa hàng.
            </p>
          </div>

          <Button
            onClick={() => router.push("/products")}
            className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold rounded-xl py-2.5 text-xs transition"
          >
            Quay lại Cửa Hàng
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isAuthorized === null) return null;

  const totalRevenueSum = orders
    .filter(o => o.status === "SUCCESS")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Cyber Grid Background Leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 z-10">
        
        {/* Admin Dashboard header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              Trung tâm quản trị Apex
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Bảng Quản Trị Hệ Thống
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-semibold leading-relaxed">
              Phân tích doanh thu bán hàng, giám sát giao dịch trực tiếp, và điều phối kho hàng & nhân sự.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={loadAdminData}
              disabled={isLoading}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
              Làm mới dữ liệu
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs Bar Selector */}
        <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Tổng quan & Thống kê", icon: LayoutDashboard },
            { id: "orders", label: "Giám sát đơn hàng", icon: FileText }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive 
                    ? "text-purple-450 font-extrabold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-purple-950/20 border border-purple-900/30 rounded-xl -z-10 shadow-lg"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon className={`h-4 w-4 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SKELETON PLACEHOLDER */}
        {isLoading && products.length === 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 bg-zinc-900/40 rounded-xl border border-zinc-800" />)}
            </div>
            <Skeleton className="h-[300px] w-full bg-zinc-900/40 rounded-xl border border-zinc-800" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TAB 1: OVERVIEW ANALYTICS */}
            {activeTab === "overview" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Stats cards list */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Revenue Sum */}
                  <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl">
                    <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Tổng Doanh Thu</span>
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-lg font-black text-white">{formatVND(totalRevenueSum)}</div>
                      <div className="text-[9px] text-emerald-450 font-bold mt-1 uppercase tracking-wider">Thành công (SUCCESS)</div>
                    </CardContent>
                  </Card>

                  {/* Total orders */}
                  <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl">
                    <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Đơn Hàng Giao Dịch</span>
                      <FileText className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-lg font-black text-white">{orders.length} đơn</div>
                      <div className="text-[9px] text-zinc-500 font-semibold mt-1">Tất cả giao dịch hệ thống</div>
                    </CardContent>
                  </Card>

                  {/* Total Products count */}
                  <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl">
                    <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Danh Mục Hàng Hóa</span>
                      <ShoppingBag className="h-4 w-4 text-purple-450" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-lg font-black text-white">{products.length} sản phẩm</div>
                      <div className="text-[9px] text-zinc-550 font-semibold mt-1">Quản lý thêm sửa xóa kho</div>
                    </CardContent>
                  </Card>

                  {/* Registered Users */}
                  <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl">
                    <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
                      <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Tài Khoản Thành Viên</span>
                      <Users className="h-4 w-4 text-fuchsia-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-lg font-black text-white">{users.length} tài khoản</div>
                      <div className="text-[9px] text-zinc-500 font-semibold mt-1">Phân quyền, khóa thời gian thực</div>
                    </CardContent>
                  </Card>
                </div>

                {/* DYNAMIC BENTO QUICK NAVIGATION CHIPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Products administration shortcut */}
                  <Card className="border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/60 transition duration-300 relative overflow-hidden group rounded-2xl shadow-2xl">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition duration-300 pointer-events-none" />
                    <CardHeader className="p-6">
                      <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-purple-400 mb-3">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm font-extrabold text-white">Quản lý kho hàng & thiết bị</CardTitle>
                      <CardDescription className="text-zinc-400 text-xs mt-1 leading-relaxed font-semibold">
                        Chỉnh sửa thuộc tính sản phẩm, cấu hình URL ảnh thật từ Unsplash, theo dõi số lượng tồn kho và thêm thiết bị mới vào danh mục catalog.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <Link href="/admin/products">
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition">
                          Truy cập Bảng Sản Phẩm
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-1 transition" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Users administration shortcut */}
                  <Card className="border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/60 transition duration-300 relative overflow-hidden group rounded-2xl shadow-2xl">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 h-32 w-32 bg-fuchsia-500/5 rounded-full blur-2xl group-hover:bg-fuchsia-500/10 transition duration-300 pointer-events-none" />
                    <CardHeader className="p-6">
                      <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-fuchsia-400 mb-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm font-extrabold text-white">An ninh tài khoản thành viên</CardTitle>
                      <CardDescription className="text-zinc-400 text-xs mt-1 leading-relaxed font-semibold">
                        Phân quyền nhân sự cấp cao hoặc phân loại tài khoản khách hàng, kích hoạt khóa/mở khóa các thành viên spam hoặc vi phạm chính sách của Apex.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <Link href="/admin/users">
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition">
                          Truy cập Bảng Tài Khoản
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-1 transition" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Graph Analytics Area Chart */}
                <Card className="border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md shadow-xl rounded-2xl">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>Báo cáo doanh số bán hàng hàng tuần</span>
                      <span className="text-[8px] bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-900/40 px-2.5 rounded-full font-bold uppercase tracking-wider">Live</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs font-semibold">
                      Tự động tính toán lượng giao dịch phát sinh qua hệ thống.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="rgba(168, 85, 247, 0.4)" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="rgba(168, 85, 247, 0)" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#09090b", borderColor: "#1f1f23", borderRadius: "12px", color: "#f4f4f5" }} 
                            formatter={(v: any) => [formatVND(v), "Doanh số"]}
                          />
                          <Area type="monotone" dataKey="Sales" stroke="rgb(168, 85, 247)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 2: ORDERS CONTROLLER OVERRIDE */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Giám sát & Xử lý giao dịch</h3>
                
                <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                  <Table>
                    <TableHeader className="bg-zinc-950/80 border-zinc-800">
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="font-extrabold text-zinc-400 text-xs pl-6 py-4">Mã Đơn</TableHead>
                        <TableHead className="font-extrabold text-zinc-400 text-xs">Email Người Mua</TableHead>
                        <TableHead className="font-extrabold text-zinc-400 text-xs">Ngày Đặt</TableHead>
                        <TableHead className="font-extrabold text-zinc-400 text-xs text-right">Tổng Tiền</TableHead>
                        <TableHead className="font-extrabold text-zinc-400 text-xs text-center w-[160px]">Trạng Thái</TableHead>
                        <TableHead className="font-extrabold text-zinc-400 text-xs text-center w-[200px]">Thao Tác Duyệt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-zinc-500 font-extrabold text-xs">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-zinc-650">Chưa có giao dịch mua sắm nào phát sinh trong hệ thống.</span>
                              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Mẹo: Đăng nhập tài khoản khách hàng và tiến hành thanh toán giỏ hàng!</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((ord) => (
                          <TableRow 
                            key={ord.id} 
                            onClick={() => handleViewOrderDetail(ord)}
                            className="border-zinc-800/50 hover:bg-zinc-900/40 cursor-pointer transition duration-150"
                          >
                            <TableCell className="font-black text-white font-mono text-xs py-4 pl-6">{ord.id}</TableCell>
                            <TableCell className="text-xs text-zinc-300 font-extrabold">{ord.customerEmail}</TableCell>
                            <TableCell className="text-xs text-zinc-400 font-semibold">{ord.createdAt}</TableCell>
                            <TableCell className="text-right text-xs font-black text-purple-400">{formatVND(ord.total)}</TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                                ord.status.toUpperCase() === "PENDING"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                                  : ord.status.toUpperCase() === "SUCCESS"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {ord.status}
                              </span>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex gap-1.5 justify-center">
                                {/* Set success */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(ord.id, "SUCCESS");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-950 text-emerald-450 border border-zinc-800 hover:bg-emerald-950/20 hover:border-emerald-800/40 text-[9px] font-black transition active:scale-95"
                                >
                                  Duyệt Đơn
                                </button>
                                
                                {/* Set failed */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(ord.id, "FAILED");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-950 text-red-400 border border-zinc-800 hover:bg-red-950/20 hover:border-red-800/40 text-[9px] font-black transition active:scale-95"
                                >
                                  Hủy Đơn
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* Premium Customer & Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl border border-zinc-800 bg-zinc-950/90 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 font-sans text-zinc-100"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -z-10 h-[200px] w-[200px] rounded-full bg-purple-500/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-emerald-500/5 blur-[80px]" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Chi tiết đơn hàng</span>
                <h3 className="text-lg font-black text-white font-mono mt-1">ĐƠN HÀNG #{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition active:scale-95 text-zinc-400 hover:text-white text-xs font-black"
              >
                Đóng
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-5 border border-zinc-800 bg-zinc-900/30 rounded-2xl">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> THÔNG TIN KHÁCH HÀNG
                </h4>

                {isDetailLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                    <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-extrabold">
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Tên khách hàng</div>
                      <div className="text-white text-sm font-black">{customerDetail?.fullName || "Chưa cập nhật"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Địa chỉ Email</div>
                      <div className="text-purple-400 text-sm font-mono">{customerDetail?.email || selectedOrder.customerEmail}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Số điện thoại</div>
                      <div className="text-white text-sm">{customerDetail?.phone || "Chưa cập nhật"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Địa chỉ nhận hàng</div>
                      <div className="text-zinc-300 text-sm leading-relaxed">{customerDetail?.address || "Chưa cập nhật"}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Breakdown */}
              <div className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl overflow-hidden">
                <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-purple-400" /> DANH SÁCH MUA SẮM
                  </h4>
                </div>

                <div className="max-h-[160px] overflow-y-auto divide-y divide-zinc-800/40 p-4 space-y-3">
                  {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 text-xs font-extrabold uppercase tracking-wider">
                      Không có chi tiết sản phẩm hoặc được đặt trực tiếp với tổng tiền {formatVND(selectedOrder.total)}
                    </div>
                  ) : (
                    selectedOrder.items.map((item: any, idx: number) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs font-extrabold py-1">
                          <div className="flex flex-col gap-1">
                            <span className="text-white text-xs font-black">{prod ? prod.name : `Sản phẩm #${item.productId}`}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Số lượng: {item.quantity}</span>
                          </div>
                          <span className="text-purple-400 font-black">{formatVND(item.price * item.quantity)}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-between items-center p-4 bg-zinc-950/80 border-t border-zinc-800/80 text-xs font-extrabold">
                  <span className="text-zinc-400 uppercase tracking-widest text-[10px]">TỔNG CỘNG ĐƠN HÀNG</span>
                  <span className="text-sm font-black text-emerald-400">{formatVND(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Trạng thái:</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                    selectedOrder.status.toUpperCase() === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : selectedOrder.status.toUpperCase() === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {selectedOrder.status.toUpperCase() === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, "SUCCESS");
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition active:scale-95 shadow-lg"
                    >
                      Duyệt đơn hàng
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, "FAILED");
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-550 text-white font-black text-xs hover:bg-red-650 transition active:scale-95 shadow-lg"
                    >
                      Hủy đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

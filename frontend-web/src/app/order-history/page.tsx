"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, RefreshCw, Clock, CheckCircle2, XCircle,
  DollarSign, ShoppingBag, Calendar, Sparkles, X,
  User, MapPin, Phone, Mail, Package, Hash, ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  rawId: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface CustomerInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { token, userId } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!token && !storedToken) {
      router.push("/");
    }
  }, [token, router]);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const fetchOrders = useCallback(async (showToast = false) => {
    try {
      const data = await apiCall("get", "/orders/my-orders");
      const mapped = (data || []).map((ord: any) => ({
        id: ord.id ? `ORD-${ord.id}` : `ORD-???`,
        rawId: ord.id,
        userId: ord.userId,
        total: ord.totalAmount ?? ord.total ?? 0,
        status: ord.status || "PENDING",
        createdAt: ord.createdAt || "",
        items: (ord.items || []).map((it: any) => ({
          id: it.id,
          productId: it.productId,
          productName: undefined,
          quantity: it.quantity,
          price: parseFloat(it.price) || 0,
        })),
      }));
      setOrders(mapped);
      if (showToast) toast.success("Dữ liệu đơn hàng đã cập nhật!");
    } catch (err) {
      toast.error("Không thể nạp danh sách đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(false); }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders(true);
    setIsRefreshing(false);
  };

  // Open order detail modal
  const handleRowClick = async (ord: Order) => {
    setSelectedOrder(ord);
    setCustomerInfo(null);
    setProductNames({});
    setModalOpen(true);
    setIsDetailLoading(true);

    try {
      // Fetch customer info
      const uid = ord.userId || userId;
      if (uid) {
        try {
          const cust = await apiCall("get", `/auth/users/${uid}`);
          setCustomerInfo(cust);
        } catch {
          console.warn("Cannot fetch customer info");
        }
      }

      // Fetch product names for each item
      const names: Record<number, string> = {};
      await Promise.all(
        ord.items.map(async (item) => {
          try {
            const prod = await apiCall("get", `/products/${item.productId}`);
            names[item.productId] = prod?.name || `Sản phẩm #${item.productId}`;
          } catch {
            names[item.productId] = `Sản phẩm #${item.productId}`;
          }
        })
      );
      setProductNames(names);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setCustomerInfo(null);
    setProductNames({});
  };

  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> Đang xử lý
          </span>
        );
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Thành công
          </span>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
            <XCircle className="h-3.5 w-3.5" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-400">
            {status}
          </span>
        );
    }
  };

  const totalSpent = orders.filter(o => o.status === "SUCCESS").reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 font-sans relative overflow-hidden">
      <Navbar />

      {/* Background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_farthest-side_at_50%_120px,rgba(124,58,237,0.06),transparent)] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
              <Sparkles className="h-3 w-3" /> Báo cáo giao dịch
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Lịch Sử Đơn Hàng</h2>
            <p className="text-xs text-zinc-400 mt-1 font-semibold">
              Nhấn vào đơn hàng để xem chi tiết sản phẩm, thông tin người mua và địa chỉ.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl py-2 px-4 flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-purple-400" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && orders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <ShoppingBag className="h-5 w-5" />, color: "text-purple-400", label: "Tổng số đơn hàng", value: `${orders.length} đơn` },
              { icon: <DollarSign className="h-5 w-5" />, color: "text-emerald-400", label: "Đã thanh toán (SUCCESS)", value: formatVND(totalSpent), valClass: "text-emerald-400" },
              { icon: <Clock className="h-5 w-5" />, color: "text-amber-400", label: "Đang xử lý (PENDING)", value: `${pendingCount} đơn`, valClass: "text-amber-400" },
            ].map((s, i) => (
              <Card key={i} className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${s.color} shadow-inner`}>{s.icon}</div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">{s.label}</span>
                    <span className={`text-lg font-black ${s.valClass || "text-white"}`}>{s.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Table */}
        {isLoading || isRefreshing ? (
          <div className="space-y-4 border border-zinc-800 bg-zinc-900/30 rounded-2xl p-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center py-3 border-t border-zinc-800/50">
                <Skeleton className="h-5 w-1/5 bg-zinc-800" />
                <Skeleton className="h-5 w-1/6 bg-zinc-800" />
                <Skeleton className="h-6 w-1/4 bg-zinc-800" />
                <Skeleton className="h-5 w-1/6 bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md rounded-2xl p-8 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-sm font-extrabold text-white mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-zinc-400 text-xs max-w-sm mb-6 leading-relaxed">
              Hãy tiến hành thanh toán giỏ hàng để bắt đầu tạo lịch sử đơn!
            </p>
            <Button onClick={() => router.push("/products")} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl py-2.5 px-6 text-xs">
              Khám phá sản phẩm ngay
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-zinc-950/80">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="font-extrabold text-zinc-400 py-4 pl-6 text-xs uppercase tracking-wider">Mã Đơn</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Ngày Đặt</span>
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">Trạng Thái</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-right pr-6 text-xs uppercase tracking-wider">Tổng Giá Trị</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-center text-xs uppercase tracking-wider">Chi Tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {orders.map((ord) => (
                    <TableRow
                      key={ord.id}
                      onClick={() => handleRowClick(ord)}
                      className="border-zinc-800/50 hover:bg-zinc-800/40 transition-all duration-150 cursor-pointer group"
                    >
                      <TableCell className="font-black text-white py-4 pl-6 font-mono text-xs tracking-wide">{ord.id}</TableCell>
                      <TableCell className="text-zinc-400 font-semibold text-xs">{formatDate(ord.createdAt)}</TableCell>
                      <TableCell className="py-3">{renderStatusBadge(ord.status)}</TableCell>
                      <TableCell className="font-black text-purple-400 text-right pr-6 text-sm">{formatVND(ord.total)}</TableCell>
                      <TableCell className="text-center">
                        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-purple-400 mx-auto transition-colors" />
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        )}
      </main>

      {/* ======= ORDER DETAIL MODAL ======= */}
      <AnimatePresence>
        {modalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-0.5">
                    <Package className="h-3 w-3" /> Chi tiết đơn hàng
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedOrder.id}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusBadge(selectedOrder.status)}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <p className="text-zinc-400 text-sm font-semibold">Đang tải thông tin đơn hàng...</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">

                  {/* Order Meta */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mã đơn hàng</span>
                      </div>
                      <p className="font-black text-white font-mono">{selectedOrder.id}</p>
                    </div>
                    <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ngày đặt hàng</span>
                      </div>
                      <p className="font-bold text-white text-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Thông tin người mua</span>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Họ và tên</p>
                          <p className="text-sm font-bold text-white">
                            {customerInfo?.fullName || customerInfo?.username || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Email</p>
                          <p className="text-sm font-bold text-white">{customerInfo?.email || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Số điện thoại</p>
                          <p className="text-sm font-bold text-white">{customerInfo?.phone || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Địa chỉ giao hàng</p>
                          <p className="text-sm font-bold text-white">{customerInfo?.address || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Sản phẩm đã đặt ({selectedOrder.items.length})
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-800">
                      {selectedOrder.items.length === 0 ? (
                        <div className="px-4 py-6 text-center text-zinc-500 text-sm">Không có sản phẩm</div>
                      ) : (
                        selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400 shrink-0">
                                <Package className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                  {productNames[item.productId] || `Sản phẩm #${item.productId}`}
                                </p>
                                <p className="text-xs text-zinc-500 font-semibold">
                                  Mã SP: {item.productId} · SL: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-sm font-black text-purple-400">{formatVND(item.price * item.quantity)}</p>
                              <p className="text-xs text-zinc-500">{formatVND(item.price)} × {item.quantity}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Total */}
                    <div className="px-4 py-3 bg-zinc-800/60 border-t border-zinc-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-300">Tổng cộng</span>
                      <span className="text-lg font-black text-purple-400">{formatVND(selectedOrder.total)}</span>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

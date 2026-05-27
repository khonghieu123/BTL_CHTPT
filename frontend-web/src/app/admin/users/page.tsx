"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiCall, User } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Users, ShieldAlert, Ban, UserCheck, Search, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, role } = useApp();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall("get", "/auth/users");
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast.error("Không nạp được danh sách tài khoản.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadUsers();
    }
  }, [isAuthorized]);

  // Live filter search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, users]);

  // Block or Unblock user
  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await apiCall("put", "/auth/users", { id: user.id, status: nextStatus });
      toast.info(`Cập nhật tài khoản ${user.username} thành: ${nextStatus === "ACTIVE" ? "Mở khóa" : "Khóa"}`);
      loadUsers();
    } catch (err) {
      toast.error("Lỗi thay đổi trạng thái tài khoản");
    }
  };

  // Swap account role
  const handleToggleRole = async (user: User) => {
    const nextRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    try {
      await apiCall("put", "/auth/users", { id: user.id, role: nextRole });
      toast.success(`Đã chuyển đổi vai trò tài khoản ${user.username} thành: ${nextRole}`);
      loadUsers();
    } catch (err) {
      toast.error("Lỗi thay đổi vai trò tài khoản");
    }
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
          <p className="text-zinc-400 text-xs font-semibold leading-relaxed">Tài khoản này không có quyền quản lý thành viên.</p>
          <Button onClick={() => router.push("/products")} className="w-full bg-zinc-100 text-zinc-900 border-0 font-bold rounded-xl text-xs py-2 shadow-sm">
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
            <Link href="/admin/products" className="px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white shadow-lg transition">
              Quản lý Sản Phẩm
            </Link>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              Bảo mật hệ thống Apex
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Quản Lý Tài Khoản
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-semibold leading-relaxed">
              Phê duyệt quyền hạn quản trị viên, giám sát trạng thái tài khoản hoạt động và đình chỉ người dùng vi phạm.
            </p>
          </div>
        </div>

        {/* Filters Top Bar */}
        <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài khoản theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-550 rounded-xl text-xs focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
              Đang giám sát {filteredUsers.length} tài khoản thành viên
            </span>
          </div>
        </Card>

        {/* Data Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full bg-zinc-900/30 rounded-xl border border-zinc-800 animate-pulse" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/30 p-12 text-center max-w-md mx-auto shadow-xl rounded-2xl">
            <Users className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Không tìm thấy tài khoản</h4>
            <p className="text-xs text-zinc-400">Thử gõ một từ khóa tìm kiếm khác.</p>
          </Card>
        ) : (
          <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-zinc-950/80 border-zinc-800">
                <TableRow className="border-zinc-850 hover:bg-transparent">
                  <TableHead className="font-extrabold text-zinc-400 text-xs w-[80px] text-center uppercase tracking-wider py-4">ID</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">Tên Đăng Nhập</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs uppercase tracking-wider">Email Liên Hệ</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs text-center w-[150px] uppercase tracking-wider">Quyền Hạn</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs text-center w-[150px] uppercase tracking-wider">Trạng Thái</TableHead>
                  <TableHead className="font-extrabold text-zinc-400 text-xs text-center w-[200px] uppercase tracking-wider">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-zinc-850/50 hover:bg-zinc-900/30 transition duration-150">
                    <TableCell className="text-center font-bold text-zinc-500 font-mono text-xs">{user.id}</TableCell>
                    
                    <TableCell className="font-extrabold text-white text-xs">{user.username}</TableCell>
                    
                    <TableCell className="text-xs text-zinc-400 font-semibold">{user.email}</TableCell>
                    
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        user.role === "ADMIN" 
                          ? "bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-900/40" 
                          : "bg-zinc-800/65 text-zinc-400 border border-zinc-750"
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        user.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-450" : "bg-red-450"}`} />
                        {user.status === "ACTIVE" ? "Hoạt động" : "Khóa"}
                      </span>
                    </TableCell>
                    
                    <TableCell className="py-2.5">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleRole(user)}
                          disabled={user.username.toLowerCase() === "admin"}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 text-[10px] font-bold transition disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
                          title="Đổi quyền hạn"
                        >
                          Swap Quyền
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.username.toLowerCase() === "admin"}
                          className={`p-1.5 rounded-lg border transition duration-150 ${
                            user.status === "ACTIVE"
                              ? "bg-zinc-900 hover:bg-red-950/20 text-red-400 border-zinc-800 hover:border-red-900/30"
                              : "bg-zinc-900 hover:bg-emerald-950/20 text-emerald-400 border-zinc-800 hover:border-emerald-900/30"
                          } disabled:opacity-30 disabled:pointer-events-none active:scale-95`}
                          title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
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
    </div>
  );
}

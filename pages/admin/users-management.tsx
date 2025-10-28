// ============================================
// نظام إدارة المستخدمين الاحترافي
// Professional User Management System
// ============================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Users, UserPlus, Search, MoreVertical, Edit, Trash2, 
  Shield, Key, Eye, EyeOff, Mail, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle, Crown, Zap,
  FileText, Settings, Lock, Unlock, Activity
} from "lucide-react";
import { Role, RoleLabels, Permission, PermissionLabels, RolePermissions } from "@shared/permissions";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { PermissionsDialog } from "@/components/admin/permissions-dialog";
import { ActivityLogDialog } from "@/components/admin/activity-log-dialog";
import { CreateUserDialogPro } from "@/components/admin/create-user-dialog-pro";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  loginCount?: number;
  lastIP?: string;
}

export default function UsersManagement() {
  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <UsersManagementContent />
    </ProtectedRoute>
  );
}

function UsersManagementContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | 'permissions' | 'activity' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.VIEWER as Role,
    phone: "",
    status: "active" as "active" | "inactive" | "suspended",
  });

  // Fetch users with auto-refresh every 30 seconds
  const { data: users = [], refetch } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when window gains focus
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("فشل إنشاء المستخدم");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "✅ تم إنشاء المستخدم",
        description: "تم إنشاء المستخدم بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطأ",
        description: "فشل إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });


  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: Role.VIEWER,
      phone: "",
      status: "active",
    });
  };

  // Handle actions
  const handleAction = (user: User, action: 'edit' | 'delete' | 'permissions' | 'activity') => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeActionDialog = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: Role) => {
    const colors = {
      [Role.SUPER_ADMIN]: "bg-red-500 hover:bg-red-600",
      [Role.ADMIN]: "bg-orange-500 hover:bg-orange-600",
      [Role.EDITOR]: "bg-yellow-500 hover:bg-yellow-600",
      [Role.AUTHOR]: "bg-green-500 hover:bg-green-600",
      [Role.MODERATOR]: "bg-blue-500 hover:bg-blue-600",
      [Role.VIEWER]: "bg-gray-500 hover:bg-gray-600",
    };
    return colors[role];
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: "نشط", color: "bg-green-500", icon: CheckCircle },
      inactive: { label: "غير نشط", color: "bg-gray-500", icon: XCircle },
      suspended: { label: "موقوف", color: "bg-red-500", icon: AlertCircle },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} text-white`}>
        <Icon className="h-3 w-3 ml-1" />
        {badge.label}
      </Badge>
    );
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === Role.SUPER_ADMIN || u.role === Role.ADMIN).length,
    editors: users.filter(u => u.role === Role.EDITOR).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <span>إدارة المستخدمين</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">نظام إدارة المستخدمين والصلاحيات المتقدم 🔐</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="h-12 px-6"
            >
              <Activity className="h-5 w-5 ml-2" />
              تحديث
            </Button>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg h-12 px-6"
            >
              <UserPlus className="h-5 w-5 ml-2" />
              <span>إضافة مستخدم جديد</span>
              <span className="mr-2">✨</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">إجمالي المستخدمين</p>
                  <p className="text-4xl font-black mt-2">{stats.total}</p>
                  <p className="text-blue-200 text-xs mt-1">Total Users</p>
                </div>
                <Users className="h-14 w-14 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-bold uppercase tracking-wider">المستخدمون النشطون</p>
                  <p className="text-4xl font-black mt-2">{stats.active}</p>
                  <p className="text-green-200 text-xs mt-1">Active Users</p>
                </div>
                <CheckCircle className="h-14 w-14 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-bold uppercase tracking-wider">المديرون</p>
                  <p className="text-4xl font-black mt-2">{stats.admins}</p>
                  <p className="text-orange-200 text-xs mt-1">Administrators</p>
                </div>
                <Crown className="h-14 w-14 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-bold uppercase tracking-wider">المحررون</p>
                  <p className="text-4xl font-black mt-2">{stats.editors}</p>
                  <p className="text-purple-200 text-xs mt-1">Editors</p>
                </div>
                <FileText className="h-14 w-14 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role}>
                      {RoleLabels[role].icon} {RoleLabels[role].ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span>قائمة المستخدمين</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-4 py-1">
                {filteredUsers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر تسجيل دخول</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.email === 'superadmin@careercanvas.com' && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                  <Crown className="h-3 w-3 ml-1" />
                                  مدير عام دائم
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                          <span className="ml-1">{RoleLabels[user.role].icon}</span>
                          {RoleLabels[user.role].ar}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(user.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {user.lastIP && (
                                <div className="text-xs text-blue-600 mt-1">
                                  IP: {user.lastIP}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-500 font-medium">لم يسجل دخول</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={(e) => {
                              e.preventDefault();
                              handleAction(user, 'edit');
                            }}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => {
                              e.preventDefault();
                              handleAction(user, 'permissions');
                            }}>
                              <Shield className="h-4 w-4 ml-2" />
                              عرض الصلاحيات
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => {
                              e.preventDefault();
                              handleAction(user, 'activity');
                            }}>
                              <Activity className="h-4 w-4 ml-2" />
                              سجل الأنشطة
                            </DropdownMenuItem>
                            {/* Hide delete button for super admin */}
                            {user.email !== 'superadmin@careercanvas.com' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleAction(user, 'delete');
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <CreateUserDialogPro
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />

        {/* Action Dialogs */}
        {selectedUser && actionType === 'edit' && (
          <EditUserDialog
            user={selectedUser}
            open={true}
            onClose={closeActionDialog}
            onSuccess={() => {
              refetch();
              closeActionDialog();
            }}
          />
        )}
        
        {selectedUser && actionType === 'delete' && (
          <DeleteUserDialog
            user={selectedUser}
            open={true}
            onClose={closeActionDialog}
            onSuccess={() => {
              refetch();
              closeActionDialog();
            }}
          />
        )}
        
        {selectedUser && actionType === 'permissions' && (
          <PermissionsDialog
            user={selectedUser}
            open={true}
            onClose={closeActionDialog}
          />
        )}
        
        {selectedUser && actionType === 'activity' && (
          <ActivityLogDialog
            user={selectedUser}
            open={true}
            onClose={closeActionDialog}
          />
        )}
      </div>
    </div>
  );
}

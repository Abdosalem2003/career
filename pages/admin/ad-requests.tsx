import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, Eye, Trash2, Calendar, User, Mail, Phone, Building2, Link as LinkIcon, MoreVertical, Download, Filter, Search, TrendingUp, FileText, AlertCircle, CheckCheck, Ban } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { AdRequest } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function AdRequestsPage() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<AdRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const { data: adRequests = [], isLoading } = useQuery<AdRequest[]>({
    queryKey: ["/api/admin/ad-requests"],
  });

  const filteredRequests = useMemo(() => {
    return adRequests.filter((request) => {
      const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) || request.email.toLowerCase().includes(searchQuery.toLowerCase()) || request.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPlacement = placementFilter === "all" || request.placement === placementFilter;
      const matchesTab = activeTab === "all" || request.status === activeTab;
      return matchesSearch && matchesStatus && matchesPlacement && matchesTab;
    });
  }, [adRequests, searchQuery, statusFilter, placementFilter, activeTab]);

  const statistics = useMemo(() => {
    const total = adRequests.length;
    const pending = adRequests.filter((r) => r.status === "pending").length;
    const approved = adRequests.filter((r) => r.status === "approved").length;
    const rejected = adRequests.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected, approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : "0" };
  }, [adRequests]);

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const response = await fetch(`/api/admin/ad-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes, reviewedBy: "admin" }),
      });
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ad-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] }); // Refresh ads list
      setViewDialogOpen(false);
      
      // Show different message if ad was auto-created
      if (data.adCreated) {
        toast({ 
          title: language === "ar" ? "✅ تم النشر!" : "✅ Published!", 
          description: language === "ar" ? "تم الموافقة على الطلب ونشر الإعلان في الموقع تلقائياً 🎉" : "Request approved and ad published automatically 🎉",
          duration: 5000,
        });
      } else {
        toast({ 
          title: language === "ar" ? "✅ تم التحديث" : "✅ Updated", 
          description: language === "ar" ? "تم تحديث حالة الطلب بنجاح" : "Request status updated successfully" 
        });
      }
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/ad-requests/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ad-requests"] });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      toast({ title: language === "ar" ? "🗑️ تم الحذف" : "🗑️ Deleted", description: language === "ar" ? "تم حذف الطلب بنجاح" : "Request deleted successfully" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: language === "ar" ? "قيد الانتظار" : "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300", icon: Clock },
      approved: { label: language === "ar" ? "موافق عليه" : "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300", icon: CheckCircle },
      rejected: { label: language === "ar" ? "مرفوض" : "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300", icon: XCircle }
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${variant.color}`}><Icon className="h-3.5 w-3.5" />{variant.label}</span>;
  };

  const getPlacementLabel = (placement: string) => {
    const labels: Record<string, { ar: string; en: string; icon: string }> = {
      header: { ar: "رأس الصفحة", en: "Header", icon: "📱" },
      "sidebar-top": { ar: "الشريط الجانبي (أعلى)", en: "Sidebar Top", icon: "📊" },
      "sidebar-middle": { ar: "الشريط الجانبي (وسط)", en: "Sidebar Middle", icon: "📈" },
      "in-article": { ar: "داخل المقال", en: "In Article", icon: "📰" },
      footer: { ar: "أسفل الصفحة", en: "Footer", icon: "📌" }
    };
    const label = labels[placement] || { ar: placement, en: placement, icon: "📍" };
    return language === "ar" ? `${label.icon} ${label.ar}` : `${label.icon} ${label.en}`;
  };

  const handleView = (request: AdRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setViewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({ id: selectedRequest.id, status: "approved", adminNotes });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({ id: selectedRequest.id, status: "rejected", adminNotes });
    }
  };

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      deleteRequestMutation.mutate(requestToDelete);
    }
  };

  const handleQuickApprove = (request: AdRequest) => {
    updateRequestMutation.mutate({ id: request.id, status: "approved", adminNotes: language === "ar" ? "تمت الموافقة السريعة" : "Quick approved" });
  };

  const handleQuickReject = (request: AdRequest) => {
    updateRequestMutation.mutate({ id: request.id, status: "rejected", adminNotes: language === "ar" ? "تم الرفض السريع" : "Quick rejected" });
  };

  const handleExportData = () => {
    const csvContent = [
      ["Name", "Email", "Company", "Placement", "Duration", "Status", "Date"],
      ...filteredRequests.map((r) => [r.name, r.email, r.company || "", r.placement, r.duration.toString(), r.status, new Date(r.createdAt).toLocaleDateString()])
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ad-requests-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: language === "ar" ? "📥 تم التصدير" : "📥 Exported", description: language === "ar" ? "تم تصدير البيانات بنجاح" : "Data exported successfully" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === "ar" ? "📢 طلبات الإعلانات" : "📢 Ad Requests"}
          </h1>
          <p className="text-muted-foreground mt-1">{language === "ar" ? "إدارة ومراجعة طلبات الإعلانات الواردة" : "Manage and review incoming ad requests"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
          <Download className="h-4 w-4" />
          {language === "ar" ? "تصدير CSV" : "Export CSV"}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{language === "ar" ? "إجمالي الطلبات" : "Total Requests"}</div>
            </div>
            <div className="text-3xl font-bold">{statistics.total}</div>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{language === "ar" ? "قيد الانتظار" : "Pending"}</div>
            </div>
            <div className="text-3xl font-bold">{statistics.pending}</div>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{language === "ar" ? "موافق عليها" : "Approved"}</div>
            </div>
            <div className="text-3xl font-bold">{statistics.approved}</div>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{language === "ar" ? "مرفوضة" : "Rejected"}</div>
            </div>
            <div className="text-3xl font-bold">{statistics.rejected}</div>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">{language === "ar" ? "معدل القبول" : "Approval Rate"}</div>
            </div>
            <div className="text-3xl font-bold">{statistics.approvalRate}%</div>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === "ar" ? "البحث والتصفية" : "Search & Filters"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={language === "ar" ? "ابحث بالاسم، البريد، أو الشركة..." : "Search by name, email, or company..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder={language === "ar" ? "تصفية بالحالة" : "Filter by status"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "جميع الحالات" : "All Statuses"}</SelectItem>
                  <SelectItem value="pending">{language === "ar" ? "قيد الانتظار" : "Pending"}</SelectItem>
                  <SelectItem value="approved">{language === "ar" ? "موافق عليها" : "Approved"}</SelectItem>
                  <SelectItem value="rejected">{language === "ar" ? "مرفوضة" : "Rejected"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={placementFilter} onValueChange={setPlacementFilter}>
                <SelectTrigger><SelectValue placeholder={language === "ar" ? "تصفية بالموقع" : "Filter by placement"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "جميع المواقع" : "All Placements"}</SelectItem>
                  <SelectItem value="header">{language === "ar" ? "رأس الصفحة" : "Header"}</SelectItem>
                  <SelectItem value="sidebar-top">{language === "ar" ? "الشريط الجانبي (أعلى)" : "Sidebar Top"}</SelectItem>
                  <SelectItem value="sidebar-middle">{language === "ar" ? "الشريط الجانبي (وسط)" : "Sidebar Middle"}</SelectItem>
                  <SelectItem value="in-article">{language === "ar" ? "داخل المقال" : "In Article"}</SelectItem>
                  <SelectItem value="footer">{language === "ar" ? "أسفل الصفحة" : "Footer"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="gap-2">
                  <FileText className="h-4 w-4" />
                  {language === "ar" ? "الكل" : "All"}
                  <Badge variant="secondary" className="ml-1">{statistics.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {language === "ar" ? "معلقة" : "Pending"}
                  <Badge variant="secondary" className="ml-1">{statistics.pending}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {language === "ar" ? "موافق" : "Approved"}
                  <Badge variant="secondary" className="ml-1">{statistics.approved}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  {language === "ar" ? "مرفوضة" : "Rejected"}
                  <Badge variant="secondary" className="ml-1">{statistics.rejected}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">{language === "ar" ? "المعلومات" : "Information"}</TableHead>
                    <TableHead className="font-bold">{language === "ar" ? "الموقع" : "Placement"}</TableHead>
                    <TableHead className="font-bold">{language === "ar" ? "المدة" : "Duration"}</TableHead>
                    <TableHead className="font-bold">{language === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="font-bold">{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className="text-right font-bold">{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">{language === "ar" ? "لا توجد طلبات" : "No requests found"}</p>
                            <p className="text-sm text-muted-foreground">{language === "ar" ? "جرب تغيير معايير البحث أو التصفية" : "Try changing your search or filter criteria"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request, index) => (
                        <motion.tr key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.05 }} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{request.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3" />{request.email}</div>
                              {request.company && <div className="text-sm text-muted-foreground flex items-center gap-2"><Building2 className="h-3 w-3" />{request.company}</div>}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{getPlacementLabel(request.placement)}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.duration}</span>
                              <span className="text-sm text-muted-foreground">{language === "ar" ? "يوم" : "days"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell><div className="text-sm">{new Date(request.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</div></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleView(request)} className="hover:bg-blue-100 dark:hover:bg-blue-900"><Eye className="h-4 w-4" /></Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>{language === "ar" ? "إجراءات سريعة" : "Quick Actions"}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {request.status === "pending" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleQuickApprove(request)} className="text-green-600">
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        {language === "ar" ? "موافقة سريعة" : "Quick Approve"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleQuickReject(request)} className="text-red-600">
                                        <Ban className="h-4 w-4 mr-2" />
                                        {language === "ar" ? "رفض سريع" : "Quick Reject"}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem onClick={() => handleView(request)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {language === "ar" ? "عرض التفاصيل" : "View Details"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(request.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {language === "ar" ? "حذف" : "Delete"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {language === "ar" ? "تفاصيل الطلب" : "Request Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">{language === "ar" ? "معلومات الاتصال" : "Contact Information"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><User className="h-4 w-4" />{language === "ar" ? "الاسم" : "Name"}</Label>
                      <p className="text-sm font-medium p-3 bg-muted rounded-lg">{selectedRequest.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Mail className="h-4 w-4" />{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                      <p className="text-sm font-medium p-3 bg-muted rounded-lg">{selectedRequest.email}</p>
                    </div>
                    {selectedRequest.phone && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Phone className="h-4 w-4" />{language === "ar" ? "الهاتف" : "Phone"}</Label>
                        <p className="text-sm font-medium p-3 bg-muted rounded-lg">{selectedRequest.phone}</p>
                      </div>
                    )}
                    {selectedRequest.company && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Building2 className="h-4 w-4" />{language === "ar" ? "الشركة" : "Company"}</Label>
                        <p className="text-sm font-medium p-3 bg-muted rounded-lg">{selectedRequest.company}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">{language === "ar" ? "تفاصيل الإعلان" : "Ad Details"}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "موقع الإعلان" : "Ad Placement"}</Label>
                    <Badge variant="outline" className="text-sm">{getPlacementLabel(selectedRequest.placement)}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" />{language === "ar" ? "رابط الإعلان" : "Ad URL"}</Label>
                    <a href={selectedRequest.adUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selectedRequest.adUrl}</a>
                  </div>
                  {selectedRequest.imagePath && (
                    <div className="space-y-2">
                      <Label>{language === "ar" ? "صورة الإعلان" : "Ad Image"}</Label>
                      <div className="rounded-lg border overflow-hidden bg-gray-50 dark:bg-gray-900">
                        <img src={selectedRequest.imagePath} alt="Ad" className="max-w-full h-auto w-full object-contain" onError={(e) => { console.error('Failed to load image:', selectedRequest.imagePath); e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'; }} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />{language === "ar" ? "مدة الإعلان" : "Duration"}</Label>
                    <p className="text-sm font-medium">{selectedRequest.duration} {language === "ar" ? "يوم" : "days"}</p>
                  </div>
                  {selectedRequest.message && (
                    <div className="space-y-2">
                      <Label>{language === "ar" ? "رسالة إضافية" : "Additional Message"}</Label>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{selectedRequest.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>{language === "ar" ? "ملاحظات المدير" : "Admin Notes"}</Label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder={language === "ar" ? "أضف ملاحظاتك هنا..." : "Add your notes here..."} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "الحالة الحالية" : "Current Status"}</Label>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedRequest?.status === "pending" && (
              <>
                <Button variant="outline" onClick={handleReject} disabled={updateRequestMutation.isPending} className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
                  <XCircle className="h-4 w-4 mr-2" />
                  {language === "ar" ? "رفض" : "Reject"}
                </Button>
                <Button onClick={handleApprove} disabled={updateRequestMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {language === "ar" ? "موافقة" : "Approve"}
                </Button>
              </>
            )}
            {selectedRequest?.status !== "pending" && (
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                {language === "ar" ? "إغلاق" : "Close"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "ar" ? "تأكيد الحذف" : "Confirm Deletion"}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ar" ? "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this request? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {language === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreVertical, Edit, Trash2, Eye, TrendingUp, MousePointer, Search, Inbox, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { CreateAdDialog } from "@/components/admin/create-ad-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { AdRequest } from "@shared/schema";

interface Ad {
  id: string;
  name: string;
  placement: string;
  url?: string;
  impressions: number;
  clicks: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function AdminAds() {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => [],
  });

  const { data: adRequests = [] } = useQuery<AdRequest[]>({
    queryKey: ["/api/admin/ad-requests"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const response = await fetch(`/api/admin/ad-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, reviewedBy: 'admin' })
      });
      if (!response.ok) throw new Error('Failed to update request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-requests'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Request status updated successfully'
      });
    }
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/ad-requests/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-requests'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully'
      });
    }
  });

  // Toggle Ad Active Status
  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      if (!response.ok) throw new Error('Failed to toggle ad');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث حالة الإعلان' : 'Ad status updated'
      });
    }
  });

  // Delete Ad
  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete ad');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Ad deleted successfully'
      });
    }
  });

  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter;
    return matchesSearch && matchesPlacement;
  });

  const getCTR = (ad: Ad) => {
    if (ad.impressions === 0) return 0;
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  };

  const getPlacementBadge = (placement: string) => {
    const variants: Record<string, any> = {
      header: { label: language === "ar" ? "الرأس" : "Header", color: "default" },
      "sidebar-top": { label: language === "ar" ? "الشريط الجانبي (أعلى)" : "Sidebar Top", color: "secondary" },
      "sidebar-middle": { label: language === "ar" ? "الشريط الجانبي (وسط)" : "Sidebar Middle", color: "secondary" },
      "in-article": { label: language === "ar" ? "داخل المقال" : "In Article", color: "outline" },
      footer: { label: language === "ar" ? "التذييل" : "Footer", color: "outline" },
    };
    const variant = variants[placement] || { label: placement, color: "outline" };
    return <Badge variant={variant.color as any}>{variant.label}</Badge>;
  };

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const activeAds = ads.filter(ad => ad.active).length;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: language === 'ar' ? 'قيد الانتظار' : 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      approved: { label: language === 'ar' ? 'موافق عليه' : 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      rejected: { label: language === 'ar' ? 'مرفوض' : 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle }
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${variant.color}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    );
  };

  const pendingCount = adRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "إدارة الإعلانات" : "Ads Management"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "إدارة الإعلانات وتتبع الأداء"
              : "Manage ads and track performance"}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "إعلان جديد" : "New Ad"}
        </Button>
      </div>

      <Tabs defaultValue="ads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {language === 'ar' ? 'الإعلانات النشطة' : 'Active Ads'}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            {language === 'ar' ? 'طلبات الإعلانات' : 'Ad Requests'}
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {language === "ar" ? "إجمالي المشاهدات" : "Total Impressions"}
                  </div>
                </div>
                <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              </CardHeader>
            </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "إجمالي النقرات" : "Total Clicks"}
              </div>
            </div>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "متوسط CTR" : "Average CTR"}
              </div>
            </div>
            <div className="text-2xl font-bold">{avgCTR}%</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "الإعلانات النشطة" : "Active Ads"}
            </div>
            <div className="text-2xl font-bold">{activeAds} / {ads.length}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في الإعلانات..." : "Search ads..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === "ar" ? "جميع المواقع" : "All Placements"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع المواقع" : "All Placements"}</SelectItem>
                <SelectItem value="header">{language === "ar" ? "الرأس" : "Header"}</SelectItem>
                <SelectItem value="sidebar-top">{language === "ar" ? "الشريط الجانبي (أعلى)" : "Sidebar Top"}</SelectItem>
                <SelectItem value="in-article">{language === "ar" ? "داخل المقال" : "In Article"}</SelectItem>
                <SelectItem value="footer">{language === "ar" ? "التذييل" : "Footer"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "الاسم" : "Name"}</TableHead>
                <TableHead>{language === "ar" ? "الموقع" : "Placement"}</TableHead>
                <TableHead>{language === "ar" ? "المشاهدات" : "Impressions"}</TableHead>
                <TableHead>{language === "ar" ? "النقرات" : "Clicks"}</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "الفترة" : "Period"}</TableHead>
                <TableHead className="text-right">
                  {language === "ar" ? "إجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>{getPlacementBadge(ad.placement)}</TableCell>
                  <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCTR(ad)}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={ad.active} 
                      onCheckedChange={(checked) => {
                        toggleAdMutation.mutate({ id: ad.id, active: checked });
                      }}
                      disabled={toggleAdMutation.isPending}
                    />
                  </TableCell>
                  <TableCell>
                    {ad.startDate && ad.endDate ? (
                      <span className="text-sm">
                        {new Date(ad.startDate).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                        {" - "}
                        {new Date(ad.endDate).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                      </span>
                    ) : (
                      <Badge variant="secondary">{language === "ar" ? "دائم" : "Permanent"}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (ad.url) window.open(ad.url, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {language === "ar" ? "معاينة" : "Preview"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingAd(ad)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {language === "ar" ? "تعديل" : "Edit"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this ad?')) {
                              deleteAdMutation.mutate(ad.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === "ar" ? "حذف" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Ad Requests content will be added here */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? 'قريباً - إدارة طلبات الإعلانات' : 'Coming Soon - Ad Requests Management'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAdDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

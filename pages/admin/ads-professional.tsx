import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  MousePointer,
  DollarSign,
  Target,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Activity,
} from "lucide-react";
import { useState, useMemo } from "react";
import { CreateAdProfessional } from "@/components/admin/create-ad-professional";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Power } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  placement: string;
  url?: string;
  filePath?: string;
  impressions: number;
  clicks: number;
  conversions?: number;
  budget?: number;
  spent?: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function AdminAdsProfessional() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);

  const { data: ads = [], isLoading, refetch } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => {
      console.log("[AdsPage] Fetching ads from API...");
      const response = await fetch("/api/admin/ads");
      if (!response.ok) throw new Error("Failed to fetch ads");
      const data = await response.json();
      console.log("[AdsPage] Fetched ads:", data);
      return data;
    },
  });

  const filteredAds = useMemo(() => {
    if (!ads || ads.length === 0) return [];
    
    return ads.filter((ad) => {
      if (!ad) return false;
      const matchesSearch = (ad.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? ad.active : !ad.active);
      return matchesSearch && matchesPlacement && matchesStatus;
    });
  }, [ads, searchTerm, placementFilter, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (adId: string) => {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ad");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setDeleteAdId(null);
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف الإعلان بنجاح" : "Ad deleted successfully",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ adId, active }: { adId: string; active: boolean }) => {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error("Failed to toggle ad status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث حالة الإعلان" : "Ad status updated",
      });
    },
  });

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setCreateDialogOpen(true);
  };

  const handleDeleteAd = (adId: string) => {
    setDeleteAdId(adId);
  };

  const confirmDelete = () => {
    if (deleteAdId) {
      deleteMutation.mutate(deleteAdId);
    }
  };

  const getCTR = (ad: Ad | undefined) => {
    if (!ad) return 0;
    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const getPlacementInfo = (placement: string) => {
    const placements: Record<string, any> = {
      header: { label: language === "ar" ? "الرأس" : "Header", color: "bg-blue-500", icon: "📱" },
      "sidebar-top": { label: language === "ar" ? "جانبي أعلى" : "Sidebar Top", color: "bg-purple-500", icon: "📊" },
      "sidebar-middle": { label: language === "ar" ? "جانبي وسط" : "Sidebar Middle", color: "bg-pink-500", icon: "📊" },
      "in-article": { label: language === "ar" ? "داخل المقال" : "In Article", color: "bg-orange-500", icon: "📰" },
      footer: { label: language === "ar" ? "التذييل" : "Footer", color: "bg-green-500", icon: "📱" },
    };
    return placements[placement] || placements.header;
  };

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalImpressions = ads.reduce((sum, ad) => sum + (ad?.impressions || 0), 0);
    const totalClicks = ads.reduce((sum, ad) => sum + (ad?.clicks || 0), 0);
    const totalConversions = ads.reduce((sum, ad) => sum + (ad?.conversions || 0), 0);
    const totalBudget = ads.reduce((sum, ad) => sum + (ad?.budget || 0), 0);
    const activeAds = ads.filter(ad => ad?.active).length;
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";

    return {
      totalAds: ads.length,
      activeAds,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalBudget,
      avgCTR,
    };
  }, [ads]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {language === "ar" ? "إدارة الإعلانات" : "Ads Management"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "ar"
                  ? "إدارة شاملة واحترافية للإعلانات مع تتبع الأداء"
                  : "Professional ad management with performance tracking"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            {language === "ar" ? "إعلان جديد" : "New Ad"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {language === "ar" ? "إجمالي الإعلانات" : "Total Ads"}
                </p>
                <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {stats.totalAds}
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {stats.activeAds} {language === "ar" ? "نشط" : "active"}
                </p>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {language === "ar" ? "المشاهدات" : "Impressions"}
                </p>
                <h3 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                  {(stats.totalImpressions / 1000).toFixed(1)}K
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  {language === "ar" ? "إجمالي المشاهدات" : "Total views"}
                </p>
              </div>
              <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-xl">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  {language === "ar" ? "النقرات" : "Clicks"}
                </p>
                <h3 className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">
                  {stats.totalClicks}
                </h3>
                <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                  CTR: {stats.avgCTR}%
                </p>
              </div>
              <div className="p-3 bg-pink-200 dark:bg-pink-800 rounded-xl">
                <MousePointer className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {language === "ar" ? "الميزانية" : "Budget"}
                </p>
                <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                  ${(stats.totalBudget / 1000).toFixed(1)}K
                </h3>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {language === "ar" ? "إجمالي الميزانية" : "Total budget"}
                </p>
              </div>
              <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-xl">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle>{language === "ar" ? "البحث والتصفية" : "Search & Filters"}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredAds.length} {language === "ar" ? "إعلان" : "ads"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع المواقع" : "All Placements"}</SelectItem>
                <SelectItem value="header">📱 {language === "ar" ? "الرأس" : "Header"}</SelectItem>
                <SelectItem value="sidebar-top">📊 {language === "ar" ? "جانبي أعلى" : "Sidebar Top"}</SelectItem>
                <SelectItem value="sidebar-middle">📊 {language === "ar" ? "جانبي وسط" : "Sidebar Middle"}</SelectItem>
                <SelectItem value="in-article">📰 {language === "ar" ? "داخل المقال" : "In Article"}</SelectItem>
                <SelectItem value="footer">📱 {language === "ar" ? "التذييل" : "Footer"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                <SelectItem value="active">{language === "ar" ? "نشط" : "Active"}</SelectItem>
                <SelectItem value="inactive">{language === "ar" ? "معطل" : "Inactive"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAds.map((ad) => {
          const placementInfo = getPlacementInfo(ad?.placement || "");
          const ctr = getCTR(ad);
          
          return (
            <Card key={ad.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              {/* Image Preview */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {ad?.filePath ? (
                  <img
                    src={ad.filePath}
                    alt={ad?.name || "Ad"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={`${placementInfo.color} text-white`}>
                    {placementInfo.icon} {placementInfo.label}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  {ad?.active ? (
                    <Badge className="bg-green-500 text-white">
                      {language === "ar" ? "نشط" : "Active"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {language === "ar" ? "معطل" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {ad?.name || "N/A"}
                    </h3>
                    {ad?.url && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        🔗 {ad.url}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(ad?.url || '#', '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        {language === "ar" ? "معاينة" : "Preview"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditAd(ad)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActiveMutation.mutate({ adId: ad.id, active: !ad.active })}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {ad.active 
                          ? (language === "ar" ? "تعطيل" : "Deactivate")
                          : (language === "ar" ? "تفعيل" : "Activate")
                        }
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-xs text-muted-foreground">{language === "ar" ? "مشاهدات" : "Views"}</p>
                    <p className="text-lg font-bold text-blue-600">{(ad?.impressions || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-xs text-muted-foreground">{language === "ar" ? "نقرات" : "Clicks"}</p>
                    <p className="text-lg font-bold text-purple-600">{(ad?.clicks || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 dark:bg-pink-950 rounded-lg">
                    <p className="text-xs text-muted-foreground">CTR</p>
                    <p className="text-lg font-bold text-pink-600">{ctr}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {ad?.budget && ad.budget > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === "ar" ? "الميزانية" : "Budget"}</span>
                      <span className="font-medium">${ad?.spent || 0} / ${ad.budget}</span>
                    </div>
                    <Progress value={((ad?.spent || 0) / ad.budget) * 100} className="h-2" />
                  </div>
                )}

                {/* Dates */}
                {(ad?.startDate || ad?.endDate) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {ad?.startDate && new Date(ad.startDate).toLocaleDateString()}
                      {ad?.endDate && ` - ${new Date(ad.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAds.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === "ar" ? "لا توجد إعلانات" : "No ads found"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {language === "ar"
                ? "ابدأ بإنشاء إعلانك الأول"
                : "Start by creating your first ad"}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء إعلان" : "Create Ad"}
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateAdProfessional 
        open={createDialogOpen} 
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingAd(null);
        }}
        editingAd={editingAd}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ar"
                ? "هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this ad? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {language === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

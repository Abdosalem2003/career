import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  MousePointer,
  Search,
  BarChart3,
  Download,
  Filter,
  Grid3x3,
  List,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { CreateAdSimple } from "@/components/admin/create-ad-simple";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
  budget?: number;
  spent?: number;
  conversions?: number;
}

const PLACEMENT_COLORS: Record<string, string> = {
  header: "#3b82f6",
  "sidebar-top": "#8b5cf6",
  "sidebar-middle": "#ec4899",
  "in-article": "#f59e0b",
  footer: "#10b981",
};

export default function AdminAdsEnhanced() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"impressions" | "clicks" | "ctr" | "name">("impressions");

  const { data: ads = [], isLoading, refetch } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => {
      console.log("[AdsPage] Fetching ads from API...");
      const response = await fetch("/api/admin/ads");
      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }
      const data = await response.json();
      console.log("[AdsPage] Fetched ads:", data);
      return data;
    },
  });

  const filteredAds = useMemo(() => {
    if (!ads || ads.length === 0) return [];
    
    return ads
      .filter((ad) => {
        if (!ad) return false;
        const matchesSearch = (ad.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter;
        const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? ad.active : !ad.active);
        return matchesSearch && matchesPlacement && matchesStatus;
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        switch (sortBy) {
          case "impressions":
            return (b.impressions || 0) - (a.impressions || 0);
          case "clicks":
            return (b.clicks || 0) - (a.clicks || 0);
          case "ctr":
            return ((b.clicks || 0) / (b.impressions || 1) || 0) - ((a.clicks || 0) / (a.impressions || 1) || 0);
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          default:
            return 0;
        }
      });
  }, [ads, searchTerm, placementFilter, statusFilter, sortBy]);

  const deleteMutation = useMutation({
    mutationFn: async (adId: string) => {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف الإعلان بنجاح" : "Ad deleted successfully",
      });
    },
  });

  const getCTR = (ad: Ad | undefined) => {
    if (!ad) return 0;
    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
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

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500/10 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {language === "ar" ? "نشط" : "Active"}
      </Badge>
    ) : (
      <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">
        <Clock className="h-3 w-3 mr-1" />
        {language === "ar" ? "معطل" : "Inactive"}
      </Badge>
    );
  };

  // Statistics
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalBudget = ads.reduce((sum, ad) => sum + (ad.budget || 0), 0);
  const totalSpent = ads.reduce((sum, ad) => sum + (ad.spent || 0), 0);
  const totalConversions = ads.reduce((sum, ad) => sum + (ad.conversions || 0), 0);
  const activeAds = ads.filter((ad) => ad.active).length;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
  const avgROI = totalSpent > 0 ? (((totalBudget - totalSpent) / totalSpent) * 100).toFixed(2) : "0";

  // Chart data
  const placementData = Object.entries(
    ads.reduce(
      (acc, ad) => {
        acc[ad.placement] = (acc[ad.placement] || 0) + ad.impressions;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([placement, impressions]) => ({
    name: placement,
    value: impressions,
    fill: PLACEMENT_COLORS[placement] || "#6b7280",
  }));

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    toast({
      title: language === "ar" ? "تم التحديث" : "Refreshed",
      description: language === "ar" ? "تم تحديث البيانات بنجاح" : "Data refreshed successfully",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === "ar" ? "إدارة الإعلانات" : "Ads Management"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {language === "ar"
              ? "إدارة شاملة للإعلانات وتتبع الأداء والإحصائيات"
              : "Comprehensive ad management with performance tracking"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === "ar" ? "إعلان جديد" : "New Ad"}
          </Button>
        </div>
      </div>

      {/* Key Stats - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Impressions */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {language === "ar" ? "المشاهدات" : "Impressions"}
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {(totalImpressions / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{ads.length} {language === "ar" ? "إعلان" : "ads"}</p>
          </CardContent>
        </Card>

        {/* Clicks */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {language === "ar" ? "النقرات" : "Clicks"}
              </div>
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {(totalClicks / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">CTR: {avgCTR}%</p>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                {language === "ar" ? "التحويلات" : "Conversions"}
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {totalConversions.toLocaleString()}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">{language === "ar" ? "معدل التحويل" : "Conversion Rate"}</p>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                {language === "ar" ? "الميزانية" : "Budget"}
              </div>
              <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              ${(totalBudget / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">{language === "ar" ? "مصروف" : "Spent"}: ${(totalSpent / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                {language === "ar" ? "العائد" : "ROI"}
              </div>
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">
              {avgROI}%
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{language === "ar" ? "العائد على الاسثمار" : "Return on Investment"}</p>
          </CardContent>
        </Card>

        {/* Active Ads */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {language === "ar" ? "نشطة" : "Active"}
              </div>
              <div className="p-2 bg-cyan-200 dark:bg-cyan-800 rounded-lg">
                <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">
              {activeAds}/{ads.length}
            </div>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">{language === "ar" ? "حالة النشاط" : "Active Status"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {ads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {language === "ar" ? "الإعلانات حسب الموقع" : "Ads by Placement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={placementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {placementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters & Controls */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              {language === "ar" ? "البحث والتصفية" : "Search & Filters"}
            </h3>
            <span className="text-sm text-muted-foreground">
              {filteredAds.length} {language === "ar" ? "إعلان" : "ads"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
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
                  <SelectItem value="sidebar-middle">{language === "ar" ? "الشريط الجانبي (وسط)" : "Sidebar Middle"}</SelectItem>
                  <SelectItem value="in-article">{language === "ar" ? "داخل المقال" : "In Article"}</SelectItem>
                  <SelectItem value="footer">{language === "ar" ? "التذييل" : "Footer"}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={language === "ar" ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="active">{language === "ar" ? "نشط" : "Active"}</SelectItem>
                  <SelectItem value="inactive">{language === "ar" ? "معطل" : "Inactive"}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impressions">{language === "ar" ? "المشاهدات" : "Impressions"}</SelectItem>
                  <SelectItem value="clicks">{language === "ar" ? "النقرات" : "Clicks"}</SelectItem>
                  <SelectItem value="ctr">CTR</SelectItem>
                  <SelectItem value="name">{language === "ar" ? "الاسم" : "Name"}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد إعلانات" : "No ads found"}
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{language === "ar" ? "الموقع" : "Placement"}</TableHead>
                  <TableHead>{language === "ar" ? "المشاهدات" : "Impressions"}</TableHead>
                  <TableHead>{language === "ar" ? "النقرات" : "Clicks"}</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">
                    {language === "ar" ? "إجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{ad?.name || "N/A"}</TableCell>
                    <TableCell>{getPlacementBadge(ad?.placement || "")}</TableCell>
                    <TableCell>{(ad?.impressions || 0).toLocaleString()}</TableCell>
                    <TableCell>{(ad?.clicks || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCTR(ad)}%</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(ad?.active || false)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {language === "ar" ? "معاينة" : "Preview"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            {language === "ar" ? "تعديل" : "Edit"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(ad.id)}
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad) => (
                <Card key={ad.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{ad?.name || "N/A"}</CardTitle>
                        <div className="mt-2">{getPlacementBadge(ad?.placement || "")}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            {language === "ar" ? "تعديل" : "Edit"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(ad.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {language === "ar" ? "حذف" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">{language === "ar" ? "المشاهدات" : "Impressions"}</p>
                        <p className="font-bold">{(ad?.impressions || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "ar" ? "النقرات" : "Clicks"}</p>
                        <p className="font-bold">{(ad?.clicks || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CTR</span>
                      <Badge>{getCTR(ad)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{language === "ar" ? "الحالة" : "Status"}</span>
                      {getStatusBadge(ad?.active || false)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAdSimple open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

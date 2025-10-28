import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MoreVertical, Edit, Trash2, Eye, Search, Filter, Download, TrendingUp, Star, Calendar, BarChart3, FileText, Flame, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { ModernArticleEditor } from "@/components/admin/modern-article-editor";
import { UltimateQuillEditor } from "@/components/admin/ultimate-quill-editor";
import { ViewArticleDialog } from "@/components/admin/view-article-dialog";
import { EditArticleDialog } from "@/components/admin/edit-article-dialog";
import { ArticleAnalyticsDialog } from "@/components/admin/article-analytics-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  excerptEn?: string;
  excerptAr?: string;
  contentEn: string;
  contentAr: string;
  categoryId: string;
  status: string;
  views: number;
  featured: boolean;
  specialReport: boolean;
  publishedAt: string;
  coverImage?: string;
  author: { name: string };
  category: { nameEn: string; nameAr: string };
  tags?: string[];
}

export default function AdminArticles() {
  return (
    <ProtectedRoute>
      <ArticlesContent />
    </ProtectedRoute>
  );
}

function ArticlesContent() {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف المقال بنجاح" : "Article deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل حذف المقال" : "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  // Toggle special report mutation
  const toggleSpecialReportMutation = useMutation({
    mutationFn: async ({ id, specialReport }: { id: string; specialReport: boolean }) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialReport: !specialReport }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update article");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/special-reports"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: variables.specialReport 
          ? (language === "ar" ? "تم إلغاء التقرير الخاص" : "Removed from special reports")
          : (language === "ar" ? "تم إضافة للتقارير الخاصة" : "Added to special reports"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تحديث المقال" : "Failed to update article",
        variant: "destructive",
      });
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      console.log("Toggling featured for article:", id, "Current:", featured, "New:", !featured);
      
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update article:", response.status, errorText);
        throw new Error(`Failed to update article: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Updated article:", data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: variables.featured 
          ? (language === "ar" ? "تم إلغاء تمييز المقال" : "Article unfeatured")
          : (language === "ar" ? "تم تمييز المقال" : "Article featured"),
      });
    },
    onError: (error: Error) => {
      console.error("Toggle featured error:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تحديث المقال" : "Failed to update article",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm(language === "ar" ? "هل أنت متأكد من حذف هذا المقال؟" : "Are you sure you want to delete this article?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  const handleToggleSpecialReport = (id: string, specialReport: boolean) => {
    toggleSpecialReportMutation.mutate({ id, specialReport });
  };

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.titleAr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || article.category?.nameEn === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Feature 1: Analytics Stats
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === "published").length,
    draft: articles.filter(a => a.status === "draft").length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const config = {
      published: { variant: "default" as const, label: language === "ar" ? "منشور" : "Published", color: "bg-green-500" },
      draft: { variant: "secondary" as const, label: language === "ar" ? "مسودة" : "Draft", color: "bg-yellow-500" },
      archived: { variant: "outline" as const, label: language === "ar" ? "مؤرشف" : "Archived", color: "bg-gray-500" },
    };
    const { variant, label } = config[status as keyof typeof config] || config.draft;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-6 rounded-2xl border border-purple-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
                {language === "ar" ? "المقالات" : "Articles"}
              </h1>
              <p className="text-sm text-gray-600">
                {language === "ar"
                  ? "إدارة جميع المقالات في النظام"
                  : "Manage all articles in the system"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Feature 2: Export Button */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {language === "ar" ? "تصدير" : "Export"}
            </Button>
            <Button 
              data-testid="button-create-article" 
              onClick={() => setLocation('/dash-unnt-2025/create-article')} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء مقال احترافي" : "Create Professional Article"}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature 3: Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {language === "ar" ? "إجمالي المقالات" : "Total Articles"}
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <Progress value={(stats.total / 100) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {language === "ar" ? "منشور" : "Published"}
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((stats.published / stats.total) * 100)}% {language === "ar" ? "من الإجمالي" : "of total"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {language === "ar" ? "مسودات" : "Drafts"}
            </CardTitle>
            <Edit className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-gray-500 mt-1">
              {language === "ar" ? "قيد التحرير" : "In progress"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {language === "ar" ? "إجمالي المشاهدات" : "Total Views"}
            </CardTitle>
            <Eye className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {language === "ar" ? "عبر جميع المقالات" : "Across all articles"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature 4: Advanced Filters */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في المقالات..." : "Search articles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={language === "ar" ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="published">{language === "ar" ? "منشور" : "Published"}</SelectItem>
                  <SelectItem value="draft">{language === "ar" ? "مسودة" : "Draft"}</SelectItem>
                  <SelectItem value="archived">{language === "ar" ? "مؤرشف" : "Archived"}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={language === "ar" ? "القسم" : "Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.nameEn}>
                      {language === "ar" ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="px-3 py-1">
                {filteredArticles.length} {language === "ar" ? "نتيجة" : "results"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Feature 5: Enhanced Table with Hover Effects */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold text-right">{language === "ar" ? "العنوان" : "Title"}</TableHead>
                  <TableHead className="font-bold text-center">{language === "ar" ? "القسم" : "Category"}</TableHead>
                  <TableHead className="font-bold text-center">{language === "ar" ? "الكاتب" : "Author"}</TableHead>
                  <TableHead className="font-bold text-center">{language === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="font-bold text-center">{language === "ar" ? "المشاهدات" : "Views"}</TableHead>
                  <TableHead className="text-center">{language === "ar" ? "مميز" : "Featured"}</TableHead>
                  <TableHead className="text-center">{language === "ar" ? "تقرير خاص" : "Special"}</TableHead>
                  <TableHead className="font-bold text-center">{language === "ar" ? "تاريخ النشر" : "Published"}</TableHead>
                  <TableHead className="text-center font-bold">
                    {language === "ar" ? "إجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow 
                    key={article.id} 
                    data-testid={`row-article-${article.id}`}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="font-semibold max-w-xs text-right">
                      <div className="flex items-center gap-2 justify-end" dir="rtl">
                        {article.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        <span className="truncate">
                          {language === "ar" ? article.titleAr : article.titleEn}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-medium">
                        {language === "ar"
                          ? article.category?.nameAr || "غير محدد"
                          : article.category?.nameEn || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-center">{article.author?.name || "N/A"}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(article.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{article.views?.toLocaleString() || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {article.featured ? (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          {language === "ar" ? "نعم" : "Yes"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {language === "ar" ? "لا" : "No"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.specialReport ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          <Flame className="h-3 w-3 mr-1" />
                          {language === "ar" ? "نعم" : "Yes"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {language === "ar" ? "لا" : "No"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(
                          "en-US",
                          { year: 'numeric', month: '2-digit', day: '2-digit' }
                        ) : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Featured Button */}
                        <Button
                          variant={article.featured ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFeatured(article.id, article.featured);
                          }}
                          disabled={toggleFeaturedMutation.isPending}
                          className={article.featured ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600" : ""}
                          title={language === "ar" ? "تمييز المقال" : "Feature Article"}
                        >
                          <Star className={`h-4 w-4 ${article.featured ? 'fill-white' : ''}`} />
                        </Button>
                        
                        {/* Toggle Special Report Button */}
                        <Button
                          variant={article.specialReport ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleSpecialReport(article.id, article.specialReport);
                          }}
                          disabled={toggleSpecialReportMutation.isPending}
                          className={article.specialReport ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" : ""}
                          title={language === "ar" ? "تقرير خاص" : "Special Report"}
                        >
                          <Flame className={`h-4 w-4 ${article.specialReport ? 'fill-white' : ''}`} />
                        </Button>
                        
                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedArticle(article as any);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="font-medium">{language === "ar" ? "عرض" : "View"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setLocation(`/dash-unnt-2025/edit-article/${article.id}`);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2 text-green-600" />
                              <span className="font-medium">{language === "ar" ? "تعديل" : "Edit"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedArticle(article as any);
                                setAnalyticsDialogOpen(true);
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                              <span className="font-medium">{language === "ar" ? "إحصائيات" : "Analytics"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(article.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span className="font-medium">{language === "ar" ? "حذف" : "Delete"}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ViewArticleDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} article={selectedArticle} />
      <EditArticleDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} article={selectedArticle} />
      <ArticleAnalyticsDialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen} article={selectedArticle} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@shared/types";
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
import { Plus, MoreVertical, Edit, Trash2, FolderOpen, Search, Layers, TrendingUp, Eye, Filter, Download, Upload, RefreshCw, Grid, List, SortAsc, Calendar, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CreateCategoryDialogPro } from "@/components/admin/create-category-dialog-pro";
import { CategoryActions } from "@/components/admin/category-actions";

interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  color?: string;
  icon?: string;
  createdAt?: Date | string;
  bannerImage?: string | null;
}

export default function AdminCategories() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  );
}

function CategoriesContent() {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name" | "articles" | "date">("name");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "empty">("all");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const getCategoryArticleCount = (categoryId: string) => {
    const articleList = Array.isArray(articles) ? articles : [];
    return (articleList as Article[]).filter((a) => a.categoryId === categoryId).length;
  };

  // Filter and sort categories
  let filteredCategories = categories.filter((category) =>
    (category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     category.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Apply status filter
  if (filterStatus === "active") {
    filteredCategories = filteredCategories.filter(cat => getCategoryArticleCount(cat.id) > 0);
  } else if (filterStatus === "empty") {
    filteredCategories = filteredCategories.filter(cat => getCategoryArticleCount(cat.id) === 0);
  }

  // Apply sorting
  filteredCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === "name") {
      return language === "ar" 
        ? a.nameAr.localeCompare(b.nameAr, "ar")
        : a.nameEn.localeCompare(b.nameEn);
    } else if (sortBy === "articles") {
      return getCategoryArticleCount(b.id) - getCategoryArticleCount(a.id);
    } else {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
  });

  // Calculate stats
  const totalArticles = Array.isArray(articles) ? articles.length : 0;
  const mostUsedCategory = categories.reduce((max, cat) => {
    const count = getCategoryArticleCount(cat.id);
    const maxCount = getCategoryArticleCount(max.id);
    return count > maxCount ? cat : max;
  }, categories[0]);

  return (
    <div className="space-y-6">
      {/* Header Section - Enhanced Modern Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <Layers className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-1" data-testid="text-page-title">
                  {language === "ar" ? "إدارة الأقسام" : "Categories Management"}
                </h1>
                <p className="text-blue-100 text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {language === "ar"
                    ? "نظّم وأدر أقسام المقالات والمحتوى بكفاءة"
                    : "Organize and manage article categories efficiently"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              data-testid="button-create-category"
            >
              <Plus className="h-5 w-5 mr-2" />
              {language === "ar" ? "قسم جديد" : "New Category"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Categories Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "إجمالي الأقسام" : "Total Categories"}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-2">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Total Articles Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "إجمالي المقالات" : "Total Articles"}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-2">{totalArticles}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Most Used Category Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الأكثر استخداماً" : "Most Used"}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-2 truncate">
                  {mostUsedCategory
                    ? language === "ar"
                      ? mostUsedCategory.nameAr
                      : mostUsedCategory.nameEn
                    : "-"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Average Articles per Category */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "المتوسط لكل قسم" : "Avg per Category"}
                </p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {categories.length > 0 ? Math.round(totalArticles / categories.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Enhanced Toolbar with Filters and View Options */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 space-y-4">
          {/* Search and Actions Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder={language === "ar" ? "ابحث عن قسم..." : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                data-testid="input-search"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 border-2">
                  <SortAsc className="h-4 w-4 mr-2" />
                  {language === "ar" ? "ترتيب" : "Sort"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  {language === "ar" ? "حسب الاسم" : "By Name"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("articles")}>
                  {language === "ar" ? "حسب المقالات" : "By Articles"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  {language === "ar" ? "حسب التاريخ" : "By Date"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 border-2">
                  <Filter className="h-4 w-4 mr-2" />
                  {language === "ar" ? "تصفية" : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  {language === "ar" ? "الكل" : "All"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  {language === "ar" ? "نشط" : "Active"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("empty")}>
                  {language === "ar" ? "فارغ" : "Empty"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button variant="outline" className="h-12 border-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Count and Active Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm font-bold">
                {filteredCategories.length} {language === "ar" ? "نتيجة" : "results"}
              </Badge>
              {filterStatus !== "all" && (
                <Badge variant="outline" className="text-sm">
                  {language === "ar" ? "مصفى: " : "Filtered: "}
                  {filterStatus === "active" ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "فارغ" : "Empty")}
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {language === "ar" ? "آخر تحديث: " : "Last updated: "}
              {new Date().toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US")}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Empty State */}
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {language === "ar" ? "لا توجد أقسام" : "No categories found"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="border-2 hover:border-blue-500 transition-all hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2" dir="rtl">
                          <h3 className="text-lg font-bold text-gray-900">{category.nameAr}</h3>
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-600">{category.nameEn}</p>
                      </div>
                      <CategoryActions 
                        categoryId={category.id}
                        categoryName={category.nameEn}
                        categoryNameAr={category.nameAr}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{language === "ar" ? "الرابط" : "Slug"}</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{category.slug}</code>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{language === "ar" ? "المقالات" : "Articles"}</span>
                        <Badge className={`${
                          getCategoryArticleCount(category.id) > 5
                            ? "bg-green-100 text-green-700"
                            : getCategoryArticleCount(category.id) > 2
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {getCategoryArticleCount(category.id)}
                        </Badge>
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Modern Table with Hover Effects */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-100 hover:bg-transparent bg-gray-50">
                    <TableHead className={`font-bold text-gray-700 ${language === "ar" ? "text-right" : "text-left"}`}>
                      {language === "ar" ? "الاسم بالعربية" : "Arabic Name"}
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 text-left">
                      {language === "ar" ? "الاسم بالإنجليزية" : "English Name"}
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">
                      {language === "ar" ? "الرابط" : "Slug"}
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 text-center">
                      {language === "ar" ? "المقالات" : "Articles"}
                    </TableHead>
                    <TableHead className="text-center font-bold text-gray-700">
                      {language === "ar" ? "الإجراءات" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow 
                      key={category.id} 
                      data-testid={`row-category-${category.id}`}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                    >
                      {/* Category Name with Badge - Fixed Arabic Alignment */}
                      <TableCell className="font-bold text-gray-900">
                        <div className="flex items-center justify-end gap-2 w-full" dir="rtl">
                          <span className="text-gray-900 font-bold text-right">{category.nameAr}</span>
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-left">{category.nameEn}</TableCell>
                      <TableCell className="text-center">
                        <code className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-mono">
                          {category.slug}
                        </code>
                      </TableCell>
                      {/* Article Count with Color Badge */}
                      <TableCell className="text-center">
                        <Badge 
                          className={`font-bold ${
                            getCategoryArticleCount(category.id) > 5
                              ? "bg-green-100 text-green-700"
                              : getCategoryArticleCount(category.id) > 2
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getCategoryArticleCount(category.id)}
                        </Badge>
                      </TableCell>
                      {/* Action Buttons */}
                      <TableCell className="text-center">
                        <CategoryActions 
                          categoryId={category.id}
                          categoryName={category.nameEn}
                          categoryNameAr={category.nameAr}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Footer Info with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-blue-600">{categories.length}</p>
              <p className="text-xs text-gray-600">{language === "ar" ? "إجمالي الأقسام" : "Total Categories"}</p>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-600">{filteredCategories.length}</p>
              <p className="text-xs text-gray-600">{language === "ar" ? "معروض" : "Displayed"}</p>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-purple-600">{totalArticles}</p>
              <p className="text-xs text-gray-600">{language === "ar" ? "مقالة" : "Articles"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {language === "ar" ? "تصدير" : "Export"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              {language === "ar" ? "استيراد" : "Import"}
            </Button>
          </div>
        </div>
      </div>

      <CreateCategoryDialogPro open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

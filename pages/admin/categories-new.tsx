import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, MoreVertical, Edit, Trash2, FolderOpen, Search, Layers, TrendingUp, Eye } from "lucide-react";
import { useState } from "react";
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog";

interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  color?: string;
  icon?: string;
}

export default function AdminCategories() {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const getCategoryArticleCount = (categoryId: string) => {
    return (articles as Article[] || []).filter((a) => a.categoryId === categoryId).length;
  };

  const filteredCategories = categories.filter((category) =>
    (category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     category.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const totalArticles = articles.length;
  const mostUsedCategory = categories.reduce((max, cat) => {
    const count = getCategoryArticleCount(cat.id);
    const maxCount = getCategoryArticleCount(max.id);
    return count > maxCount ? cat : max;
  }, categories[0]);

  return (
    <div className="space-y-6">
      {/* Header Section - Feature 1: Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black" data-testid="text-page-title">
                  {language === "ar" ? "الأقسام" : "Categories"}
                </h1>
                <p className="text-blue-100 text-sm">
                  {language === "ar"
                    ? "إدارة أقسام المقالات والمحتوى"
                    : "Manage article categories and content"}
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
            data-testid="button-create-category"
          >
            <Plus className="h-5 w-5 mr-2" />
            {language === "ar" ? "قسم جديد" : "New Category"}
          </Button>
        </div>
      </div>

      {/* Stats Section - Feature 2: Animated Stats Cards */}
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

      {/* Search and Table Section - Feature 3: Modern Search Bar */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder={language === "ar" ? "ابحث عن قسم..." : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-11 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="input-search"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {filteredCategories.length} {language === "ar" ? "نتيجة" : "results"}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Feature 4: Empty State with Illustration */}
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {language === "ar" ? "لا توجد أقسام" : "No categories found"}
              </p>
            </div>
          ) : (
            /* Feature 5: Modern Table with Hover Effects */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-100 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-700">{language === "ar" ? "الاسم بالعربية" : "Arabic Name"}</TableHead>
                    <TableHead className="font-bold text-gray-700">{language === "ar" ? "الاسم بالإنجليزية" : "English Name"}</TableHead>
                    <TableHead className="font-bold text-gray-700">{language === "ar" ? "الرابط" : "Slug"}</TableHead>
                    <TableHead className="font-bold text-gray-700">{language === "ar" ? "المقالات" : "Articles"}</TableHead>
                    <TableHead className="font-bold text-gray-700">{language === "ar" ? "اللون" : "Color"}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      {language === "ar" ? "الإجراءات" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow 
                      key={category.id} 
                      data-testid={`row-category-${category.id}`}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                    >
                      {/* Feature 6: Category Name with Badge */}
                      <TableCell className="font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {category.nameAr}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{category.nameEn}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-mono">
                          {category.slug}
                        </code>
                      </TableCell>
                      {/* Feature 7: Article Count with Color Badge */}
                      <TableCell>
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
                      {/* Feature 8: Color Preview with Gradient */}
                      <TableCell>
                        {category.color && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-lg border-2 border-gray-200 shadow-sm"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-xs font-mono text-gray-600">{category.color}</span>
                          </div>
                        )}
                      </TableCell>
                      {/* Feature 9: Action Buttons with Icons */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{language === "ar" ? "عرض المقالات" : "View Articles"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2 text-green-600" />
                              <span>{language === "ar" ? "تعديل" : "Edit"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>{language === "ar" ? "حذف" : "Delete"}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature 10: Footer Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-gray-600 text-center">
          {language === "ar" 
            ? `تم عرض ${filteredCategories.length} من ${categories.length} قسم`
            : `Showing ${filteredCategories.length} of ${categories.length} categories`
          }
        </p>
      </div>

      <CreateCategoryDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

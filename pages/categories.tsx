import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdPlacement } from "@/components/ad-placement";
import { SpecialReports } from "@/components/special-reports";
import type { Category } from "@shared/types";

export default function CategoriesPage() {
  const { language } = useI18n();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryColor = (slug: string) => {
    const colors: Record<string, string> = {
      'politics': 'from-red-600 to-pink-600',
      'economy': 'from-green-600 to-emerald-600',
      'technology': 'from-blue-600 to-cyan-600',
      'sports': 'from-orange-600 to-yellow-600',
      'health': 'from-purple-600 to-pink-600',
      'culture': 'from-indigo-600 to-purple-600',
      'science': 'from-teal-600 to-blue-600',
      'entertainment': 'from-pink-600 to-rose-600',
      'business': 'from-blue-700 to-blue-500',
      'world': 'from-gray-600 to-gray-800'
    };
    return colors[slug] || 'from-blue-600 to-purple-600';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-page-title">
            {language === "ar" ? "جميع الأقسام" : "All Categories"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "تصفح الأخبار حسب القسم" : "Browse news by category"}
          </p>
        </div>

        {/* Special Reports Section */}
        <div className="my-12">
          <SpecialReports />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const color = getCategoryColor(category.slug);
              return (
                <Link key={category.id} href={`/category/${category.slug}`} data-testid={`card-category-${category.slug}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full cursor-pointer group rounded-2xl">
                    {/* Image Container */}
                    <div className={`h-40 bg-gradient-to-br ${color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Trending Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className={`bg-gradient-to-r ${color} text-white`}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {language === "ar" ? "جديد" : "New"}
                        </Badge>
                      </div>
                    </div>
                    {/* Content */}
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-2xl font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300" data-testid={`text-category-${category.slug}`}>
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === "ar" ? "اكتشف أحدث الأخبار" : "Discover latest news"}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "اضغط للمزيد" : "Click to explore"}
                        </span>
                        <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            {language === "ar" ? "لا توجد أقسام" : "No categories available"}
          </p>
        )}

        {/* Footer Ad */}
        <AdPlacement placement="footer" className="mt-12" />
      </div>
    </div>
  );
}

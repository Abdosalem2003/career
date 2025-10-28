import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Article {
  id: string;
  titleAr: string;
  titleEn: string;
  views: number;
  publishedAt: string;
  category?: {
    nameAr: string;
    nameEn: string;
  };
}

export default function TotalViewsPage() {
  return (
    <ProtectedRoute>
      <TotalViewsContent />
    </ProtectedRoute>
  );
}

function TotalViewsContent() {
  const { language } = useI18n();

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const averageViews = articles.length > 0 ? Math.round(totalViews / articles.length) : 0;
  
  // Sort articles by views
  const topArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  // Calculate growth (mock data - يمكن استبداله ببيانات حقيقية)
  const lastMonthViews = Math.round(totalViews * 0.88); // 12% growth
  const growth = totalViews - lastMonthViews;
  const growthPercentage = lastMonthViews > 0 ? Math.round((growth / lastMonthViews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Eye className="h-8 w-8 text-orange-500" />
            {language === "ar" ? "إجمالي المشاهدات" : "Total Views"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === "ar" 
              ? "تحليل شامل لمشاهدات جميع المقالات" 
              : "Comprehensive analysis of all article views"}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {totalViews.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Views */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "إجمالي المشاهدات" : "Total Views"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {growthPercentage >= 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={growthPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(growthPercentage)}%
              </span>
              <span className="text-gray-500">
                {language === "ar" ? "من الشهر الماضي" : "from last month"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Views */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "متوسط المشاهدات" : "Average Views"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {averageViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {language === "ar" ? "لكل مقال" : "per article"}
            </div>
          </CardContent>
        </Card>

        {/* Total Articles */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "عدد المقالات" : "Total Articles"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {articles.length}
            </div>
            <div className="text-sm text-gray-500">
              {language === "ar" ? "مقال منشور" : "published articles"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Articles */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            {language === "ar" ? "المقالات الأكثر مشاهدة" : "Top Viewed Articles"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {topArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {language === "ar" ? "لا توجد مقالات" : "No articles found"}
            </div>
          ) : (
            <div className="space-y-4">
              {topArticles.map((article, index) => {
                const percentage = totalViews > 0 ? (article.views / totalViews) * 100 : 0;
                
                return (
                  <div
                    key={article.id}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div
                        className={`
                          h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg
                          ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : ""}
                          ${index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" : ""}
                          ${index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" : ""}
                          ${index > 2 ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" : ""}
                        `}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {language === "ar" ? article.titleAr : article.titleEn}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">
                            {language === "ar" ? article.category.nameAr : article.category.nameEn}
                          </Badge>
                        )}
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.publishedAt).toLocaleDateString(
                              language === "ar" ? "ar-EG" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {article.views.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
                          </span>
                          <span className="text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>

                    {/* Views Badge */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Eye className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-600">
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

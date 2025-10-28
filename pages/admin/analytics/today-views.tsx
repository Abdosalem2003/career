import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Clock, Eye, BarChart3, ArrowUp } from "lucide-react";
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

export default function TodayViewsPage() {
  return (
    <ProtectedRoute>
      <TodayViewsContent />
    </ProtectedRoute>
  );
}

function TodayViewsContent() {
  const { language } = useI18n();

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Filter today's articles
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayArticles = articles.filter((article) => {
    if (!article.publishedAt) return false;
    const publishDate = new Date(article.publishedAt);
    publishDate.setHours(0, 0, 0, 0);
    return publishDate.getTime() === today.getTime();
  });

  const todayViews = todayArticles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const todayPercentage = totalViews > 0 ? (todayViews / totalViews) * 100 : 0;

  // Sort today's articles by views
  const topTodayArticles = [...todayArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  // Calculate hourly stats (mock data - يمكن استبداله ببيانات حقيقية)
  const currentHour = new Date().getHours();
  const hourlyViews = Math.round(todayViews / (currentHour + 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-cyan-500" />
            {language === "ar" ? "مشاهدات اليوم" : "Today's Views"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {today.toLocaleDateString(
              language === "ar" ? "ar-EG" : "en-US",
              { weekday: "long", year: "numeric", month: "long", day: "numeric" }
            )}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {todayViews.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Today's Views */}
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "مشاهدات اليوم" : "Today's Views"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {todayViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-cyan-600">
              <ArrowUp className="h-4 w-4" />
              <span>{todayPercentage.toFixed(1)}%</span>
              <span className="text-gray-500">
                {language === "ar" ? "من الإجمالي" : "of total"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Articles */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "مقالات اليوم" : "Today's Articles"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {todayArticles.length}
            </div>
            <div className="text-sm text-gray-500">
              {language === "ar" ? "مقال منشور" : "published"}
            </div>
          </CardContent>
        </Card>

        {/* Average per Article */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "متوسط المشاهدات" : "Avg per Article"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {todayArticles.length > 0 
                ? Math.round(todayViews / todayArticles.length).toLocaleString()
                : "0"}
            </div>
            <div className="text-sm text-gray-500">
              {language === "ar" ? "مشاهدة/مقال" : "views/article"}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Rate */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {language === "ar" ? "معدل الساعة" : "Hourly Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {hourlyViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {language === "ar" ? "مشاهدة/ساعة" : "views/hour"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Top Articles */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            {language === "ar" ? "المقالات الأكثر مشاهدة اليوم" : "Top Articles Today"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {topTodayArticles.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                {language === "ar" ? "لا توجد مقالات منشورة اليوم" : "No articles published today"}
              </p>
              <p className="text-gray-400 text-sm">
                {language === "ar" 
                  ? "ستظهر المقالات المنشورة اليوم هنا" 
                  : "Articles published today will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topTodayArticles.map((article, index) => {
                const percentage = todayViews > 0 ? (article.views / todayViews) * 100 : 0;
                
                return (
                  <div
                    key={article.id}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div
                        className={`
                          h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg
                          ${index === 0 ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white" : ""}
                          ${index === 1 ? "bg-gradient-to-br from-cyan-300 to-blue-400 text-white" : ""}
                          ${index === 2 ? "bg-gradient-to-br from-cyan-200 to-blue-300 text-white" : ""}
                          ${index > 2 ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" : ""}
                        `}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {language === "ar" ? article.titleAr : article.titleEn}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {language === "ar" ? "جديد" : "New"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {language === "ar" ? article.category.nameAr : article.category.nameEn}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(article.publishedAt).toLocaleTimeString(
                            language === "ar" ? "ar-EG" : "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {article.views.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
                          </span>
                          <span className="text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
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

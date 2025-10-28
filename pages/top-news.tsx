import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Clock, 
  Eye, 
  ArrowRight, 
  Flame,
  Calendar
} from "lucide-react";
import { Link } from "wouter";

interface Article {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  slug: string;
  coverImage: string;
  categoryId: string;
  views: number;
  publishedAt: Date;
  category?: {
    nameAr: string;
    nameEn: string;
  };
}

export default function TopNewsPage() {
  const { language } = useI18n();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/top-news"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {language === "ar" ? "أهم الأخبار" : "Top News"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {language === "ar" 
                  ? "تابع آخر الأخبار والأحداث من مصادر موثوقة" 
                  : "Follow the latest news and events from trusted sources"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white dark:bg-gray-800 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "إجمالي الأخبار" : "Total News"}
                  </p>
                  <p className="text-2xl font-bold">{articles.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "اليوم" : "Today"}
                  </p>
                  <p className="text-2xl font-bold">
                    {articles.filter(a => {
                      const today = new Date();
                      const pubDate = new Date(a.publishedAt);
                      return pubDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-800 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "الأكثر مشاهدة" : "Most Viewed"}
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.max(...articles.map(a => a.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card className="p-12 text-center">
            <Flame className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "ar" ? "لا توجد أخبار حالياً" : "No news available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {language === "ar" 
                ? "تحقق مرة أخرى لاحقاً للحصول على آخر الأخبار" 
                : "Check back later for the latest news"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Link key={article.id} href={`/article/${article.slug}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 h-full flex flex-col">
                  {/* Ranking Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={language === "ar" ? article.titleAr : article.titleEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <Flame className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {article.category && (
                      <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-500">
                        {language === "ar" ? article.category.nameAr : article.category.nameEn}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {language === "ar" ? article.titleAr : article.titleEn}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                      {language === "ar" ? article.excerptAr : article.excerptEn}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(
                            language === "ar" ? "ar-SA" : "en-US",
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{(article.views || 0).toLocaleString()}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Placeholder */}
        {articles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === "ar" 
                ? `عرض ${articles.length} من أهم الأخبار` 
                : `Showing ${articles.length} top news articles`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

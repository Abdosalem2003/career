import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ArrowLeft, ArrowRight, TrendingUp, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleWithRelations } from "@shared/types";

interface EnhancedLatestArticlesProps {
  articles: ArticleWithRelations[];
  loading?: boolean;
}

export function EnhancedLatestArticles({ articles, loading }: EnhancedLatestArticlesProps) {
  const { language, t } = useI18n();

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured Article Skeleton */}
            <Skeleton className="h-[500px] lg:col-span-2" />
            
            {/* Regular Articles Skeleton */}
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[280px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === "ar" ? "لا توجد مقالات حالياً" : "No articles available"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1, 31); // 30 مقال عادي

  const formatDate = (dateString: Date | string) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return language === "ar" ? "منذ دقائق" : "Minutes ago";
    } else if (diffInHours < 24) {
      return language === "ar" ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return language === "ar" ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
    }
  };

  return (
    <section className="py-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header - Inspired by the image */}
        <div className="mb-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-['Cairo']">
                  {language === "ar" ? "أهم الأخبار" : "Top News"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <Link href="/top-news">
              <Button
                variant="ghost"
                className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950"
              >
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {language === "ar" ? "المزيد" : "View More"}
                </span>
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            {language === "ar" 
              ? "تابع آخر الأخبار والمستجدات من مصادر موثوقة" 
              : "Follow the latest news and updates from trusted sources"}
          </p>
        </div>

        {/* Articles Grid - Inspired Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Article - Large Card */}
          <Link href={`/article/${featuredArticle.slug}`} className="lg:col-span-2 group">
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white dark:bg-gray-800">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-[300px] md:h-full overflow-hidden">
                  {featuredArticle.coverImage ? (
                    <img
                      src={featuredArticle.coverImage || ''}
                      alt={language === "ar" ? (featuredArticle.titleAr || '') : (featuredArticle.titleEn || '')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <TrendingUp className="h-20 w-20 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Overlay Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                      {language === "ar" ? "🔥 عاجل" : "🔥 Breaking"}
                    </Badge>
                  </div>

                  {/* Category Badge */}
                  {featuredArticle.category && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 text-xs font-semibold">
                        {language === "ar" ? featuredArticle.category.nameAr : featuredArticle.category.nameEn}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-['Cairo'] leading-relaxed">
                      {language === "ar" ? featuredArticle.titleAr : featuredArticle.titleEn}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 text-base leading-relaxed">
                      {language === "ar" ? featuredArticle.excerptAr : featuredArticle.excerptEn}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(featuredArticle.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>{featuredArticle.views || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Regular Articles - Grid Layout */}
          {regularArticles.map((article, index) => (
            <Link key={article.id} href={`/article/${article.slug}`} className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-0 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-5 gap-0 h-full">
                  {/* Image Section - 2 columns */}
                  <div className="col-span-2 relative h-full min-h-[200px] overflow-hidden">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage || ''}
                        alt={language === "ar" ? (article.titleAr || '') : (article.titleEn || '')}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <TrendingUp className="h-12 w-12 text-white opacity-50" />
                      </div>
                    )}

                    {/* Category Badge */}
                    {article.category && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-2 py-0.5 text-xs font-semibold">
                          {language === "ar" ? article.category.nameAr : article.category.nameEn}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section - 3 columns */}
                  <div className="col-span-3 p-4 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-['Cairo'] leading-relaxed">
                        {language === "ar" ? article.titleAr : article.titleEn}
                      </h4>
                      
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mb-3 leading-relaxed">
                        {language === "ar" ? article.excerptAr : article.excerptEn}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{article.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View More Button - Bottom */}
        {articles.length > 31 && (
          <div className="mt-8 text-center">
            <Link href="/articles">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {language === "ar" ? "عرض المزيد من الأخبار" : "View More News"}
                {language === "ar" ? (
                  <ArrowLeft className="h-5 w-5 mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 ml-2" />
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

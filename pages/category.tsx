import { useParams } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, TrendingUp, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AdPlacement } from "@/components/ad-placement";
import MatchesWidget from "@/components/MatchesWidget";
import type { Article, Category } from "@shared/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language, dir } = useI18n();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});

  // Fetch category
  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  // Fetch articles
  const { data: articles = [], isLoading: loadingArticles } = useQuery<Article[]>({
    queryKey: [`/api/articles/category/${slug}`],
    enabled: !!slug,
  });

  // Category colors
  const categoryColors: Record<string, string> = {
    'politics': 'from-red-600 to-pink-600',
    'economy': 'from-green-600 to-emerald-600',
    'technology': 'from-blue-600 to-cyan-600',
    'sports': 'from-orange-600 to-yellow-600',
    'health': 'from-purple-600 to-pink-600',
    'culture': 'from-indigo-600 to-purple-600',
    'science': 'from-teal-600 to-blue-600',
    'entertainment': 'from-pink-600 to-rose-600',
  };

  const categoryColor = categoryColors[slug || ''] || 'from-blue-600 to-purple-600';
  const categoryName = category ? (language === "ar" ? category.nameAr : category.nameEn) : "";

  // Featured articles for banner
  const featuredArticles = articles.filter(a => a.featured).slice(0, 5);
  const regularArticles = articles.filter(a => !a.featured);

  if (loadingCategory) {
    return (
      <div className="min-h-screen space-y-8 p-4 md:p-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            {language === "ar" ? "القسم غير موجود" : "Category not found"}
          </h1>
        </div>
      </div>
    );
  }

  const currentBanner = featuredArticles[currentBannerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8">
        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${categoryColor}`} />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{categoryName}</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === "ar" ? `استكشف أحدث الأخبار والمقالات في قسم ${categoryName}` : `Explore the latest news and articles in ${categoryName}`}
          </p>
        </div>

        {/* Banner Carousel */}
        {featuredArticles.length > 0 && currentBanner && (
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl group h-96 md:h-[500px]">
            {/* Background Image */}
            <img
              src={currentBanner.coverImage || ""}
              alt={(language === "ar" ? currentBanner.titleAr : currentBanner.titleEn) || ""}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-black/70 via-black/50 to-transparent`} />

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12 text-white`}>
              <div className="max-w-2xl">
                {/* Category Badge */}
                <div className={`inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r ${categoryColor} rounded-full w-fit`}>
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-semibold">{categoryName}</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight line-clamp-2">
                  {language === "ar" ? currentBanner.titleAr : currentBanner.titleEn}
                </h2>

                {/* Excerpt */}
                <p className="text-base md:text-lg text-gray-200 mb-6 line-clamp-2">
                  {language === "ar" ? currentBanner.excerptAr : currentBanner.excerptEn}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">{(currentBanner.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-sm">{language === "ar" ? "الأكثر قراءة" : "Trending"}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/article/${currentBanner.slug}`}>
                  <Button className={`bg-gradient-to-r ${categoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {language === "ar" ? "اقرأ المزيد" : "Read More"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation Buttons */}
            {featuredArticles.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length)}
                  className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-4' : 'left-4'} z-10 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % featuredArticles.length)}
                  className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-10 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Dots */}
            {featuredArticles.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {featuredArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentBannerIndex
                        ? `w-8 bg-white`
                        : `w-2 bg-white/50 hover:bg-white/75`
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matches Widget - أسفل البانر في قسم الرياضة */}
        {slug === 'sports' && (
          <div className="mb-8">
            <MatchesWidget />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {language === "ar" ? "الترتيب:" : "Sort by:"}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { value: "latest", label: language === "ar" ? "الأحدث" : "Latest" },
              { value: "trending", label: language === "ar" ? "الأكثر قراءة" : "Trending" },
              { value: "popular", label: language === "ar" ? "الأكثر شهرة" : "Popular" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? `bg-gradient-to-r ${categoryColor}` : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : regularArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full cursor-pointer group rounded-2xl">
                  {/* Image */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={article.coverImage || ""}
                      alt={(language === "ar" ? article.titleAr : article.titleEn) || ""}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className={`absolute bottom-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} z-10`}>
                      <Badge className={`bg-gradient-to-r ${categoryColor} text-white`}>
                        {categoryName}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 flex flex-col p-4 md:p-5">
                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {language === "ar" ? article.titleAr : article.titleEn}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                      {language === "ar" ? article.excerptAr : article.excerptEn}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        <span>{(article.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{article.readingTime || 5} {language === "ar" ? "دقيقة" : "min"}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button className={`w-full bg-gradient-to-r ${categoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold`}>
                      {language === "ar" ? "اقرأ المقال" : "Read Article"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === "ar" ? "لا توجد مقالات في هذا القسم حالياً" : "No articles in this category yet"}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {regularArticles.length > 9 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className={`bg-gradient-to-r ${categoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
            >
              {language === "ar" ? "تحميل المزيد" : "Load More"}
            </Button>
          </div>
        )}

        {/* Footer Ad */}
        <AdPlacement placement="footer" className="mt-12" />
      </div>
    </div>
  );
}

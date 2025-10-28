import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Calendar, Eye, Clock, ChevronLeft, ChevronRight, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ArticleWithRelations } from "@shared/schema";

interface ProfessionalHeroSectionProps {
  articles: ArticleWithRelations[];
}

export function ProfessionalHeroSection({ articles }: ProfessionalHeroSectionProps) {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel - كل 3 ثوانٍ
  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [articles.length, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev + 1) % mainArticles.length);
        setIsPaused(true);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev - 1 + mainArticles.length) % mainArticles.length);
        setIsPaused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % mainArticles.length);
      setIsPaused(true);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + mainArticles.length) % mainArticles.length);
      setIsPaused(true);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!articles || articles.length === 0) return null;

  // دعم عدد لا نهائي من المقالات
  const mainArticles = articles; // جميع المقالات
  const maxSideArticles = 4; // عدد التقارير الجانبية
  const sideArticles = articles.slice(0, Math.min(maxSideArticles, articles.length));
  const currentArticle = mainArticles[currentIndex] || mainArticles[0];

  return (
    <div className="mb-10">
      {/* Enhanced Hero Section with Dark Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')]" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold text-lg">
                  {language === "ar" ? "الأخبار العاجلة" : "Breaking News"}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span>{language === "ar" ? "آخر الأخبار" : "Latest Updates"}</span>
                <span className="text-blue-500">|</span>
                <span className="text-blue-400">{articles.length} {language === "ar" ? "مقالات" : "Articles"}</span>
              </div>
            </div>

            {/* Navigation */}
            {mainArticles.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + mainArticles.length) % mainArticles.length)}
                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % mainArticles.length)}
                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Featured Article */}
            <Link href={`/article/${currentArticle.slug}`}>
              <div className="group cursor-pointer">
                {/* Image */}
                {currentArticle.coverImage && (
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-4">
                    <img
                      src={currentArticle.coverImage}
                      alt={(language === "ar" ? currentArticle.titleAr : currentArticle.titleEn) || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Stats Overlay */}
                    <div className="absolute top-4 right-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>{currentArticle.views?.toLocaleString() || 0}</span>
                      </div>
                      {currentArticle.category && (
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold">
                          {language === "ar" ? currentArticle.category.nameAr : currentArticle.category.nameEn}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-blue-500 transition-colors">
                  {language === "ar" ? currentArticle.titleAr : currentArticle.titleEn}
                </h2>

                {/* Excerpt */}
                {(language === "ar" ? currentArticle.excerptAr : currentArticle.excerptEn) && (
                  <p className="text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {language === "ar" ? currentArticle.excerptAr : currentArticle.excerptEn}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(currentArticle.publishedAt || new Date()).toLocaleDateString(
                      language === "ar" ? "ar-SA" : "en-US",
                      { month: 'short', day: 'numeric' }
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5 {language === "ar" ? "دقائق" : "min"}
                  </span>
                </div>

                {/* Read More Button */}
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                  {language === "ar" ? "اقرأ المزيد »" : "Read More »"}
                </Button>
              </div>
            </Link>

            {/* Side Reports List */}
            <div className="space-y-3">
              {sideArticles.map((article, index) => {
                const reportTitle = language === "ar" ? article.titleAr : article.titleEn;
                const isActive = index === currentIndex;
                
                return (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <div
                      className={cn(
                        "group flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer",
                        isActive 
                          ? "bg-blue-500/20 border-l-4 border-blue-500" 
                          : "bg-white/5 hover:bg-white/10 border-l-4 border-transparent"
                      )}
                      onClick={() => setCurrentIndex(index)}
                    >
                      {/* Thumbnail */}
                      {article.coverImage && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={reportTitle || ""}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-semibold line-clamp-2 leading-tight mb-1 transition-colors",
                          isActive ? "text-blue-400" : "text-white group-hover:text-blue-400"
                        )}>
                          {reportTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Eye className="h-3 w-3" />
                          <span>{article.views?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Progress Dots */}
          {mainArticles.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {mainArticles.length <= 10 ? (
                // عرض جميع النقاط إذا كان العدد 10 أو أقل
                mainArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "w-8 bg-gradient-to-r from-blue-600 to-purple-600"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))
              ) : (
                // عرض مؤشر رقمي إذا كان العدد أكثر من 10
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + mainArticles.length) % mainArticles.length)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {currentIndex + 1} / {mainArticles.length}
                  </div>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % mainArticles.length)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* تم إزالة Bottom Row - الأخبار الآن داخل البانر فقط */}
    </div>
  );
}

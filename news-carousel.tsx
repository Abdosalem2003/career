import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Eye, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { ArticleWithRelations } from "@shared/schema";

interface NewsCarouselProps {
  articles: ArticleWithRelations[];
}

export function NewsCarousel({ articles }: NewsCarouselProps) {
  const { language } = useI18n();
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Triple articles for seamless infinite scroll
  const infiniteArticles = [...articles, ...articles, ...articles];
  
  // Calculate animation duration based on number of articles (slower = more readable)
  const animationDuration = articles.length * 6; // 6 seconds per article

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Manual scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
    setIsPaused(false);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 py-8 rounded-2xl">
      {/* Header */}
      <div className="container mx-auto max-w-7xl px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {language === "ar" ? "آخر الأخبار" : "Latest News"}
              </h2>
              <p className="text-sm text-gray-500">
                {language === "ar" ? "تحديث مستمر من جميع الأقسام" : "Continuous updates from all categories"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              {articles.length} {language === "ar" ? "خبر" : "news"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="h-8 gap-2"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {language === "ar" ? (isAutoPlay ? "إيقاف" : "تشغيل") : (isAutoPlay ? "Pause" : "Play")}
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Control Buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-50"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-50"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Scrolling Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div
          className="flex gap-4"
          onMouseEnter={() => isAutoPlay && setIsPaused(true)}
          onMouseLeave={() => isAutoPlay && setIsPaused(false)}
          style={{
            animation: isAutoPlay && !isPaused ? `scroll ${animationDuration}s linear infinite` : 'none',
            width: 'fit-content',
          }}
        >
          {infiniteArticles.map((article, index) => (
          <Link key={`${article.id}-${index}`} href={`/article/${article.slug}`}>
            <Card className="flex-shrink-0 w-80 h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={language === "ar" ? article.titleAr : article.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
                
                {/* Category Badge */}
                {article.category && (
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 backdrop-blur-sm">
                    {language === "ar" ? article.category.nameAr : article.category.nameEn}
                  </Badge>
                )}

                {/* Featured Badge */}
                {article.featured && (
                  <Badge className="absolute top-3 right-3 bg-yellow-400 text-gray-900">
                    ⭐ {language === "ar" ? "مميز" : "Featured"}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {language === "ar" ? article.titleAr : article.titleEn}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {language === "ar" ? article.excerptAr : article.excerptEn}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.publishedAt || new Date()).toLocaleDateString(
                      language === "ar" ? "ar-SA" : "en-US",
                      { month: 'short', day: 'numeric' }
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views || 0}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>

      {/* Gradient Overlays for fade effect */}
      <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-pink-50 to-transparent pointer-events-none" />

      {/* Status Indicators */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {isPaused && isAutoPlay && (
          <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            {language === "ar" ? "متوقف مؤقتاً" : "Paused"}
          </div>
        )}
        {!isAutoPlay && (
          <div className="bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
            <span>{language === "ar" ? "يدوي" : "Manual"}</span>
          </div>
        )}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

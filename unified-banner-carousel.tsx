import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Link } from 'wouter';
import type { ArticleWithRelations } from '@shared/schema';

interface UnifiedBannerCarouselProps {
  articles: ArticleWithRelations[];
  height?: string;
  autoPlayInterval?: number;
  showMetadata?: boolean;
  categoryBadgeColor?: string;
}

/**
 * مكون Banner موحد يمكن استخدامه في جميع الصفحات
 * Unified Banner Component for all pages
 * 
 * @example
 * <UnifiedBannerCarousel 
 *   articles={featuredArticles} 
 *   height="h-[500px]"
 *   autoPlayInterval={3000}
 * />
 */
export function UnifiedBannerCarousel({
  articles,
  height = 'h-[450px] lg:h-[550px]',
  autoPlayInterval = 3000,
  showMetadata = true,
  categoryBadgeColor = 'bg-blue-600'
}: UnifiedBannerCarouselProps) {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [articles.length, isPaused, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setIsPaused(true);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
        setIsPaused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [articles.length]);

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
      setCurrentIndex((prev) => (prev + 1) % articles.length);
      setIsPaused(true);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
      setIsPaused(true);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  return (
    <div className="relative group">
      <Link href={`/article/${currentArticle.slug}`}>
        <div 
          className={`relative overflow-hidden rounded-2xl shadow-xl ${height} bg-gradient-to-br from-blue-900 to-gray-900 cursor-pointer`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Horizontal Sliding Carousel */}
          <div 
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {articles.map((article) => (
              <div key={article.id} className="w-full h-full flex-shrink-0">
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={(language === "ar" ? article.titleAr : article.titleEn) || ""}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-8 z-20">
            {/* Top: Category Badge & Navigation */}
            <div className="flex items-start justify-between">
              {currentArticle.category && (
                <span className={`inline-block ${categoryBadgeColor} text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg`}>
                  {language === "ar" ? currentArticle.category.nameAr : currentArticle.category.nameEn}
                </span>
              )}
              
              {/* Top Navigation Buttons */}
              {articles.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
                      setIsPaused(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Previous slide"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                  <span className="bg-white/30 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                    {currentIndex + 1}/{articles.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex((prev) => (prev + 1) % articles.length);
                      setIsPaused(true);
                    }}
                    className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Next slide"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom: Title & Meta */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight line-clamp-2 font-['Cairo']">
                {language === "ar" ? currentArticle.titleAr : currentArticle.titleEn}
              </h1>

              <p className="text-sm md:text-base text-gray-200 line-clamp-2 font-['Cairo']">
                {language === "ar" ? currentArticle.excerptAr : currentArticle.excerptEn}
              </p>

              {showMetadata && (
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(currentArticle.publishedAt || new Date()).toLocaleDateString(
                      "en-US",
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {currentArticle.views?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {currentArticle.readingTime || 5} {language === "ar" ? "دقائق" : "min"}
                  </span>
                </div>
              )}

              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-lg">
                {language === "ar" ? "اقرأ المزيد" : "Read More"}
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Progress Indicators */}
          {articles.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentIndex(i);
                    setIsPaused(true);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    i === currentIndex 
                      ? "w-12 bg-blue-500 shadow-lg shadow-blue-500/50" 
                      : "w-2 bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

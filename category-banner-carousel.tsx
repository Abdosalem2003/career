import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface BannerArticle {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImage: string;
  views: number;
  category: string;
  slug: string;
}

interface CategoryBannerCarouselProps {
  articles: BannerArticle[];
  categoryName: string;
  categoryColor?: string;
}

export function CategoryBannerCarousel({
  articles,
  categoryName,
  categoryColor = 'from-blue-600 to-purple-600'
}: CategoryBannerCarouselProps) {
  const { language, dir } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-play carousel - كل 3 ثوانٍ
  useEffect(() => {
    if (!autoPlay || articles.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 3000); // ✅ تغيير من 5000 إلى 3000

    return () => clearInterval(interval);
  }, [autoPlay, articles.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
    setAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
    setAutoPlay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  if (articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];
  const title = language === 'ar' ? currentArticle.titleAr : currentArticle.titleEn;
  const excerpt = language === 'ar' ? currentArticle.excerptAr : currentArticle.excerptEn;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl group">
      {/* Background Image with Overlay */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Image */}
            <img
              src={article.coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-black/70 via-black/50 to-transparent`} />
          </div>
        ))}

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12 text-white`}>
          <div className="max-w-2xl">
            {/* Category Badge */}
            <div className={`inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r ${categoryColor} rounded-full w-fit`}>
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">{categoryName}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight line-clamp-2">
              {title}
            </h1>

            {/* Excerpt */}
            <p className="text-base md:text-lg text-gray-200 mb-6 line-clamp-2">
              {excerpt}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <span className="text-sm">{currentArticle.views.toLocaleString()} {language === 'ar' ? 'مشاهدة' : 'views'}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm">{language === 'ar' ? 'الأكثر قراءة' : 'Trending'}</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              className={`bg-gradient-to-r ${categoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
              onClick={() => window.location.href = `/article/${currentArticle.slug}`}
            >
              {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
            </Button>
          </div>
        </div>

        {/* Top Navigation Buttons - أزرار التحكم العلوية */}
        {articles.length > 1 && (
          <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
            <span className="bg-white/30 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
              {currentIndex + 1}/{articles.length}
            </span>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? `w-8 bg-white`
                : `w-2 bg-white/50 hover:bg-white/75`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-white text-sm">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>{language === 'ar' ? 'تشغيل تلقائي' : 'Auto-play'}</span>
      </div>
    </div>
  );
}

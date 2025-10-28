import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Eye, TrendingUp, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Link } from 'wouter';
import type { ArticleWithRelations } from '@shared/schema';

interface RelatedCarouselProps {
  articles: ArticleWithRelations[];
  className?: string;
}

export function RelatedCarousel({ articles, className }: RelatedCarouselProps) {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoPlay || isDragging) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlay, isDragging]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (articles.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
          >
            <TrendingUp className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {language === 'ar' ? 'أخبار ذات صلة' : 'Related News'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'اكتشف المزيد من المواضيع المشابهة' : 'Discover more similar topics'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        {articles.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="hover:scale-110 transition-transform"
              title={isAutoPlay ? 'Pause' : 'Play'}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="hover:scale-110 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="hover:scale-110 transition-transform"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-6"
          animate={{
            x: `calc(-${currentIndex * (100 / 3)}% - ${currentIndex * 1.5}rem)`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {articles.map((article, index) => {
            const title = language === 'ar' ? article.titleAr : article.titleEn;
            const excerpt = language === 'ar' ? article.excerptAr : article.excerptEn;
            const categoryName = language === 'ar' ? article.category?.nameAr : article.category?.nameEn;

            return (
              <motion.div
                key={article.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/article/${article.slug}`}>
                  <Card className="group relative overflow-hidden h-full cursor-pointer border-2 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-2xl">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {article.coverImage && (
                        <>
                          <img
                            src={article.coverImage}
                            alt={title || ''}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        </>
                      )}

                      {/* Category Badge */}
                      {categoryName && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full backdrop-blur-sm">
                            {categoryName}
                          </span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {article.featured && (
                        <div className="absolute top-3 right-3">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-2 py-1 text-xs font-bold bg-yellow-500 text-black rounded-full"
                          >
                            ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {title}
                      </h3>

                      {/* Excerpt */}
                      {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        {article.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.readingTime} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views || 0}</span>
                        </div>
                        {article.publishedAt && (
                          <span className="ml-auto">
                            {new Date(article.publishedAt).toLocaleDateString(
                              language === 'ar' ? 'ar-EG' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500 dark:group-hover:border-purple-400 rounded-lg transition-all duration-300 pointer-events-none" />
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
            )}
          />
        ))}
      </div>
    </div>
  );
}

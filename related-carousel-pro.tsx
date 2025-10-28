import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Eye, TrendingUp, Pause, Play, Sparkles, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Link } from 'wouter';
import type { ArticleWithRelations } from '@shared/schema';

interface RelatedCarouselProProps {
  articles: ArticleWithRelations[];
  className?: string;
}

export function RelatedCarouselPro({ articles, className }: RelatedCarouselProProps) {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay || articles.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(articles.length / 3));
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay, articles.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(articles.length / 3));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(articles.length / 3)) % Math.ceil(articles.length / 3));
  };

  if (articles.length === 0) return null;

  const visibleArticles = articles.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <div className={cn('relative py-12', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50"
            />
            <div className="relative p-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {language === 'ar' ? 'أخبار ذات صلة' : 'Related News'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? 'اكتشف المزيد من المواضيع المشابهة' : 'Discover more similar topics'}
            </p>
          </div>
        </motion.div>

        {/* Navigation Controls */}
        {articles.length > 3 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="hover:scale-110 transition-transform hover:bg-purple-50 dark:hover:bg-purple-950"
              title={isAutoPlay ? 'Pause' : 'Play'}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="hover:scale-110 transition-transform hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="hover:scale-110 transition-transform hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden" ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {visibleArticles.map((article, index) => {
              const title = language === 'ar' ? article.titleAr : article.titleEn;
              const excerpt = language === 'ar' ? article.excerptAr : article.excerptEn;
              const categoryName = language === 'ar' ? article.category?.nameAr : article.category?.nameEn;
              const authorName = article.author?.name;

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  <Link href={`/article/${article.slug}`}>
                    <Card className="group relative overflow-hidden h-full cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                      {/* Image Container */}
                      <div className="relative h-56 overflow-hidden">
                        {article.coverImage ? (
                          <>
                            <motion.img
                              src={article.coverImage}
                              alt={title || ''}
                              className="w-full h-full object-cover"
                              animate={{
                                scale: hoveredIndex === index ? 1.15 : 1,
                              }}
                              transition={{ duration: 0.6 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <TrendingUp className="h-16 w-16 text-white opacity-30" />
                          </div>
                        )}

                        {/* Category Badge */}
                        {categoryName && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-4 left-4"
                          >
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg px-3 py-1 text-xs font-bold">
                              {categoryName}
                            </Badge>
                          </motion.div>
                        )}

                        {/* Featured Badge */}
                        {article.featured && (
                          <motion.div
                            animate={{
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-4 right-4"
                          >
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-0 shadow-lg px-3 py-1 text-xs font-bold">
                              ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
                            </Badge>
                          </motion.div>
                        )}

                        {/* Overlay Stats */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">{article.views || 0}</span>
                            </div>
                            {article.readingTime && (
                              <div className="flex items-center gap-1 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-semibold">
                                  {article.readingTime} {language === 'ar' ? 'د' : 'min'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-6 space-y-4">
                        {/* Title */}
                        <motion.h3
                          className="font-bold text-xl line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300"
                          animate={{
                            y: hoveredIndex === index ? -2 : 0,
                          }}
                        >
                          {title}
                        </motion.h3>

                        {/* Excerpt */}
                        {excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {excerpt}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {authorName && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span className="font-medium">{authorName}</span>
                              </div>
                            )}
                          </div>
                          {article.publishedAt && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(article.publishedAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-SA' : 'en-US',
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Hover Border Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        animate={{
                          boxShadow: hoveredIndex === index
                            ? '0 0 0 2px rgba(147, 51, 234, 0.5)'
                            : '0 0 0 0px rgba(147, 51, 234, 0)',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicators */}
      {articles.length > 3 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(articles.length / 3) }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
                  : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}

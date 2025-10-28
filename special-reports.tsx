import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { ArticleWithRelations } from '@shared/schema';
import { cn } from '@/lib/utils';

interface SpecialReportsProps {
  categoryId?: string;
  className?: string;
}

export function SpecialReports({ categoryId, className }: SpecialReportsProps) {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // جلب التقارير الخاصة
  const { data: reports } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/special-reports', categoryId],
    enabled: true,
  });

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay || !reports || reports.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reports.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlay, reports]);

  const handleNext = () => {
    if (reports) {
      setCurrentIndex((prev) => (prev + 1) % reports.length);
    }
  };

  const handlePrev = () => {
    if (reports) {
      setCurrentIndex((prev) => (prev - 1 + reports.length) % reports.length);
    }
  };

  if (!reports || reports.length === 0) return null;

  const currentReport = reports[currentIndex];
  const title = language === 'ar' ? currentReport.titleAr : currentReport.titleEn;
  const excerpt = language === 'ar' ? currentReport.excerptAr : currentReport.excerptEn;

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/pattern.svg')]" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Flame className="h-5 w-5" />
              <span className="font-bold text-lg">
                {language === 'ar' ? 'التقارير الخاصة' : 'Special Reports'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span>{language === 'ar' ? 'أخبار الرياضة' : 'Sports News'}</span>
              <span className="text-green-500">|</span>
              <span>{language === 'ar' ? 'الكل' : 'All'}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Featured Report */}
          <Link href={`/article/${currentReport.slug}`}>
            <div className="group cursor-pointer">
              {/* Image */}
              {currentReport.coverImage && (
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-4">
                  <img
                    src={currentReport.coverImage}
                    alt={title || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Stats Overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span>{currentReport.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full">
                      <Flame className="h-4 w-4" />
                      <span>{reports.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-green-500 transition-colors">
                {title}
              </h2>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {excerpt}
                </p>
              )}

              {/* Read More Button */}
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
                {language === 'ar' ? 'اقرأ المزيد »' : 'Read More »'}
              </Button>
            </div>
          </Link>

          {/* Side Reports List */}
          <div className="space-y-3">
            {reports.slice(0, Math.min(4, reports.length)).map((report, index) => {
              const reportTitle = language === 'ar' ? report.titleAr : report.titleEn;
              const isActive = index === currentIndex;
              
              return (
                <Link key={report.id} href={`/article/${report.slug}`}>
                  <div
                    className={cn(
                      'group flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer',
                      isActive 
                        ? 'bg-green-500/20 border-l-4 border-green-500' 
                        : 'bg-white/5 hover:bg-white/10 border-l-4 border-transparent'
                    )}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {/* Thumbnail */}
                    {report.coverImage && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={report.coverImage}
                          alt={reportTitle || ''}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'text-sm font-semibold line-clamp-2 leading-tight mb-1 transition-colors',
                        isActive ? 'text-green-500' : 'text-white group-hover:text-green-500'
                      )}>
                        {reportTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Eye className="h-3 w-3" />
                        <span>{report.views?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Progress Dots - Smart Display */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {reports.length <= 10 ? (
            reports.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                )}
              />
            ))
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
                {currentIndex + 1} / {reports.length}
              </div>
              <button
                onClick={handleNext}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

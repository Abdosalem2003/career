import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

export function MediaCarousel({ items, className }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const currentItem = items[currentIndex];

  // Auto-play للصور فقط
  useEffect(() => {
    if (!isAutoPlay || currentItem.type === 'video') return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlay, currentItem.type]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Main Carousel */}
      <div className={cn('relative group overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5', className)}>
        {/* Media Container */}
        <div className="relative aspect-video w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.alt || `Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={currentItem.url}
                  poster={currentItem.thumbnail}
                  controls
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          
          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            onClick={handleFullscreen}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {currentIndex + 1} / {items.length}
          </div>
        </div>

        {/* Thumbnails Navigation */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  'relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300',
                  index === currentIndex
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-white/50 hover:border-white/80 scale-100'
                )}
              >
                <img
                  src={item.type === 'image' ? item.url : item.thumbnail || item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Progress Dots (Mobile) */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={closeFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="relative max-w-7xl w-full" onClick={(e) => e.stopPropagation()}>
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.alt || `Slide ${currentIndex + 1}`}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={currentItem.url}
                  poster={currentItem.thumbnail}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              )}

              {items.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

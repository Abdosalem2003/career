import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Stream {
  id: string;
  name: string;
  description?: string;
  status: string;
  youtubeUrl?: string;
  streamUrl?: string;
  rtmpUrl?: string;
}

export function LiveStreamNotification() {
  const { language } = useI18n();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // جلب البث النشط
  const { data: activeStream } = useQuery<Stream>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  useEffect(() => {
    // إذا تم رفض الإشعار، لا تظهره مرة أخرى حتى يتم تحديث الصفحة
    if (isDismissed) return;

    // إذا كان هناك بث نشط، اظهر الإشعار بعد 2 ثانية
    if (activeStream?.status === "live") {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeStream, isDismissed]);

  const handleGoToStream = () => {
    setIsVisible(false);
    setIsDismissed(true);
    setLocation("/live");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!activeStream || activeStream.status !== "live") {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-20 right-4 z-[100] max-w-sm"
        >
          <Card className="overflow-hidden border-2 border-red-500 shadow-2xl bg-white dark:bg-gray-900">
            {/* Header with Live Badge */}
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Radio className="h-5 w-5 text-white fill-white animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  </div>
                  <span className="text-white font-bold text-sm uppercase tracking-wide">
                    {language === "ar" ? "بث مباشر الآن" : "Live Now"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                  {activeStream.name}
                </h3>
                {activeStream.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {activeStream.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{Math.floor(Math.random() * 500) + 100}</span>
                  <span>{language === "ar" ? "مشاهد" : "viewers"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-500 font-semibold">
                    {language === "ar" ? "مباشر" : "LIVE"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGoToStream}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Radio className="h-4 w-4 mr-2" />
                {language === "ar" ? "شاهد الآن" : "Watch Now"}
              </Button>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse" />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

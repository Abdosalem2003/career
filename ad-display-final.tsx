import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Ad {
  id: string;
  name: string;
  placement: string;
  filePath?: string;
  url?: string;
  impressions?: number;
  clicks?: number;
  active: boolean;
}

interface AdDisplayProps {
  placement: "header" | "sidebar-top" | "sidebar-middle" | "in-article" | "footer";
  className?: string;
}

export function AdDisplayFinal({ placement, className = "" }: AdDisplayProps) {
  const { language } = useI18n();
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الإعلانات من الـ API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/ads/placement/${placement}`);
        if (!response.ok) {
          throw new Error("Failed to fetch ads");
        }
        
        const data = await response.json();
        console.log(`[AdDisplay] Fetched ads for ${placement}:`, data);
        
        setAds(data || []);
      } catch (err) {
        console.error(`[AdDisplay] Error fetching ads for ${placement}:`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
    
    // إعادة جلب الإعلانات كل دقيقة
    const interval = setInterval(fetchAds, 60000);
    return () => clearInterval(interval);
  }, [placement]);

  // تتبع المشاهدات
  useEffect(() => {
    if (ads.length > 0 && !loading) {
      const currentAd = ads[currentAdIndex];
      const trackImpression = async () => {
        try {
          await fetch(`/api/ads/${currentAd.id}/impression`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" }
          });
          console.log(`[AdDisplay] Tracked impression for ad: ${currentAd.id}`);
        } catch (error) {
          console.error("[AdDisplay] Error tracking impression:", error);
        }
      };

      trackImpression();
    }
  }, [currentAdIndex, ads, loading]);

  // تدوير الإعلانات كل 10 ثوانٍ
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${className}`} />
    );
  }

  if (error || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // تحديد أبعاد الإعلان حسب الموقع
  const adDimensions: Record<string, string> = {
    header: "w-full h-20 md:h-24 lg:h-28",
    "sidebar-top": "w-full h-64 md:h-72 lg:h-80",
    "sidebar-middle": "w-full h-64 md:h-72 lg:h-80",
    "in-article": "w-full h-48 md:h-64 lg:h-72",
    footer: "w-full h-20 md:h-24 lg:h-28",
  };

  const handleAdClick = async () => {
    try {
      await fetch(`/api/ads/${currentAd.id}/click`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      console.log(`[AdDisplay] Tracked click for ad: ${currentAd.id}`);
      
      if (currentAd.url) {
        window.open(currentAd.url, "_blank");
      }
    } catch (error) {
      console.error("[AdDisplay] Error tracking click:", error);
    }
  };

  return (
    <div className={`ad-display-final ${className}`}>
      <div
        className={`${adDimensions[placement] || "w-full h-64"} bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group relative`}
        onClick={handleAdClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleAdClick();
          }
        }}
      >
        {/* الصورة */}
        {currentAd.filePath && (
          <img
            src={currentAd.filePath}
            alt={currentAd.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}

        {/* طبقة التراكب عند التمرير */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* عداد الإعلانات المتعددة */}
        {ads.length > 1 && (
          <div className="absolute bottom-2 right-2 left-2 flex gap-1 justify-center">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAdIndex(index);
                }}
                className={`h-1 rounded-full transition-all ${
                  index === currentAdIndex
                    ? "bg-white w-3"
                    : "bg-white/50 w-1 hover:bg-white/75"
                }`}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* معلومات الإعلان */}
        <div className="absolute top-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded truncate">
            {currentAd.name}
          </p>
        </div>
      </div>

      {/* أزرار التحكم */}
      {ads.length > 1 && (
        <div className="flex gap-2 mt-2 justify-center">
          <button
            onClick={() => setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous ad"
          >
            ←
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {currentAdIndex + 1} / {ads.length}
          </span>
          <button
            onClick={() => setCurrentAdIndex((prev) => (prev + 1) % ads.length)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Next ad"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

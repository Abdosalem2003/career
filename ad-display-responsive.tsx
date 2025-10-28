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

export function AdDisplayResponsive({ placement, className = "" }: AdDisplayProps) {
  const { language } = useI18n();
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // جلب الإعلانات من الـ API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/admin/ads/placement/${placement}`);
        if (response.ok) {
          const data = await response.json();
          setAds(data.filter((ad: Ad) => ad.active));
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement]);

  // تتبع المشاهدات
  useEffect(() => {
    if (ads.length > 0) {
      const currentAd = ads[currentAdIndex];
      const trackImpression = async () => {
        try {
          await fetch(`/api/ads/${currentAd.id}/impression`, { method: "POST" });
        } catch (error) {
          console.error("Error tracking impression:", error);
        }
      };

      trackImpression();
    }
  }, [currentAdIndex, ads]);

  // تدوير الإعلانات كل 10 ثوانٍ
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // تحديد أبعاد الإعلان حسب الموقع
  const adDimensions = {
    header: "w-full h-24 md:h-20 lg:h-24",
    "sidebar-top": "w-full h-64 md:h-72",
    "sidebar-middle": "w-full h-64 md:h-72",
    "in-article": "w-full h-48 md:h-64 lg:h-80",
    footer: "w-full h-24 md:h-20 lg:h-24",
  };

  const handleAdClick = async () => {
    try {
      await fetch(`/api/ads/${currentAd.id}/click`, { method: "POST" });
      if (currentAd.url) {
        window.open(currentAd.url, "_blank");
      }
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  return (
    <div className={`ad-display-responsive ${className}`}>
      <div
        className={`${adDimensions[placement]} bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group relative`}
        onClick={handleAdClick}
      >
        {/* الصورة */}
        {currentAd.filePath && (
          <img
            src={currentAd.filePath}
            alt={currentAd.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          >
            ←
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {currentAdIndex + 1} / {ads.length}
          </span>
          <button
            onClick={() => setCurrentAdIndex((prev) => (prev + 1) % ads.length)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

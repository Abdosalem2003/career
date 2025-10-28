import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  placement: string;
  filePath?: string;
  url?: string;
  impressions?: number;
  clicks?: number;
  active: boolean;
  targetPages?: string[];
}

interface AdPlacementProps {
  placement: "header" | "sidebar-top" | "sidebar-middle" | "in-article" | "footer";
  className?: string;
}

export function AdPlacement({ placement, className = "" }: AdPlacementProps) {
  const { language } = useI18n();
  const [location] = useLocation();
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // تحديد الصفحة الحالية
  const getCurrentPage = () => {
    if (location === "/") return "home";
    if (location.startsWith("/articles")) return "articles";
    if (location.startsWith("/article/")) return "article";
    if (location.startsWith("/categories")) return "categories";
    if (location.startsWith("/category/")) return "categories";
    if (location.startsWith("/about")) return "about";
    return "home";
  };

  const currentPage = getCurrentPage();

  // جلب الإعلانات من الـ API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ads/placement/${placement}`);
        if (!response.ok) throw new Error("Failed to fetch ads");
        
        const data = await response.json();
        console.log(`[AdPlacement] Fetched ads for ${placement}:`, data);
        
        // تصفية الإعلانات حسب الصفحة الحالية
        const filteredAds = data.filter((ad: Ad) => {
          if (!ad.targetPages || ad.targetPages.length === 0) return true;
          return ad.targetPages.includes(currentPage) || ad.targetPages.includes("all");
        });
        
        setAds(filteredAds || []);
      } catch (err) {
        console.error(`[AdPlacement] Error fetching ads for ${placement}:`, err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement, currentPage]);

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
          console.log(`[AdPlacement] Tracked impression for ad: ${currentAd.id}`);
        } catch (error) {
          console.error("[AdPlacement] Error tracking impression:", error);
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
        setImageLoaded(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${getPlacementDimensions(placement)} ${className}`} />
    );
  }

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  const handleAdClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // تتبع النقرة
      const response = await fetch(`/api/ads/${currentAd.id}/click`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        console.log(`[AdPlacement] Tracked click for ad: ${currentAd.id}`);
        
        // فتح الرابط في نافذة جديدة
        if (currentAd.url) {
          window.open(currentAd.url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("[AdPlacement] Error tracking click:", error);
    }
  };

  return (
    <Card
      className={`${getPlacementDimensions(placement)} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group relative border-0 ${className}`}
      onClick={handleAdClick}
      role="button"
      tabIndex={0}
      data-testid={`ad-${placement}`}
    >
      {/* الصورة - Responsive */}
      {currentAd.filePath && (
        <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={currentAd.filePath}
            alt={currentAd.name}
            className={`w-full h-full transition-all duration-500 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${getImageObjectFit(placement)}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error("[AdPlacement] Image load error:", currentAd.filePath);
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {/* طبقة التراكب عند التمرير */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* معلومات الإعلان */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between text-white">
          <p className="text-sm font-semibold truncate flex-1">{currentAd.name}</p>
          <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
        </div>
        {currentAd.url && (
          <p className="text-xs text-white/80 truncate mt-1">{currentAd.url}</p>
        )}
      </div>

      {/* Badge الإعلان */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-black/50 text-white px-2 py-1 rounded backdrop-blur-sm">
          {language === "ar" ? "إعلان" : "Ad"}
        </span>
      </div>

      {/* عداد الإعلانات المتعددة */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAdIndex(index);
                setImageLoaded(false);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentAdIndex
                  ? "bg-white w-4"
                  : "bg-white/50 w-1.5 hover:bg-white/75"
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// دالة للحصول على أبعاد الإعلان حسب الموقع
function getPlacementDimensions(placement: string): string {
  const dimensions: Record<string, string> = {
    header: "w-full aspect-[8/1] max-h-32 min-h-[100px]",
    "sidebar-top": "w-full aspect-[6/5] max-h-80",
    "sidebar-middle": "w-full aspect-[6/5] max-h-80",
    "in-article": "w-full aspect-[2/1] max-h-72",
    footer: "w-full aspect-[8/1] max-h-32 min-h-[100px]",
  };
  return dimensions[placement] || "w-full h-64";
}

// دالة للحصول على object-fit المناسب
function getImageObjectFit(placement: string): string {
  const objectFit: Record<string, string> = {
    header: "object-cover",
    "sidebar-top": "object-contain",
    "sidebar-middle": "object-contain",
    "in-article": "object-cover",
    footer: "object-cover",
  };
  return objectFit[placement] || "object-cover";
}

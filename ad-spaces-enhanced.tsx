import { useState, useEffect } from 'react';
import { X, Play, Pause } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface AdSpace {
  id: string;
  position: 'top' | 'sidebar-top' | 'sidebar-middle' | 'sidebar-bottom' | 'bottom';
  width: number;
  height: number;
  content?: React.ReactNode;
  backgroundColor?: string;
}

interface AdSpacesProps {
  position: 'top' | 'sidebar-top' | 'sidebar-middle' | 'sidebar-bottom' | 'bottom';
  width?: number;
  height?: number;
  className?: string;
}

interface AdData {
  id: string;
  name: string;
  filePath: string;
  url: string;
  placement: string;
  active: boolean;
}

const PLACEMENT_MAP: Record<string, string> = {
  'top': 'header',
  'sidebar-top': 'sidebar-top',
  'sidebar-middle': 'sidebar-middle',
  'sidebar-bottom': 'sidebar-middle',
  'bottom': 'footer',
};

export function AdSpaceEnhanced({ position, width = 300, height = 250, className = '' }: AdSpacesProps) {
  const { language } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const placementKey = PLACEMENT_MAP[position];

  // Fetch ads for this placement
  const { data: ads = [] } = useQuery<AdData[]>({
    queryKey: [`/api/admin/ads/placement/${placementKey}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/admin/ads/placement/${placementKey}`);
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeAds = ads.filter(ad => ad.active);
  const currentAd = activeAds[currentAdIndex] || null;

  // Track impression
  useEffect(() => {
    if (currentAd && isVisible && !isPaused) {
      const timer = setTimeout(() => {
        fetch(`/api/ads/${currentAd.id}/impression`, { method: 'POST' }).catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentAd, isVisible, isPaused]);

  // Rotate ads every 10 seconds
  useEffect(() => {
    if (activeAds.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [activeAds.length, isPaused]);

  const handleAdClick = () => {
    if (currentAd) {
      fetch(`/api/ads/${currentAd.id}/click`, { method: 'POST' }).catch(console.error);
      if (currentAd.url) {
        window.open(currentAd.url, '_blank');
      }
    }
  };

  if (!isVisible) return null;

  const adConfigs: Record<string, { bg: string; label: string }> = {
    'top': { bg: 'from-blue-500 to-cyan-500', label: 'Top Banner Ad' },
    'sidebar-top': { bg: 'from-purple-500 to-pink-500', label: 'Sidebar Top Ad' },
    'sidebar-middle': { bg: 'from-orange-500 to-red-500', label: 'Sidebar Middle Ad' },
    'sidebar-bottom': { bg: 'from-green-500 to-emerald-500', label: 'Sidebar Bottom Ad' },
    'bottom': { bg: 'from-indigo-500 to-blue-500', label: 'Bottom Banner Ad' }
  };

  const config = adConfigs[position];

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg group ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {currentAd ? (
        <>
          {/* Ad Image */}
          <img
            src={currentAd.filePath}
            alt={currentAd.name}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleAdClick}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="250"%3E%3Crect fill="%23f0f0f0" width="300" height="250"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />

          {/* Ad Info Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          {/* Ad Counter */}
          {activeAds.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
              {currentAdIndex + 1}/{activeAds.length}
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {activeAds.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 bg-black/60 hover:bg-black/80 text-white"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Placeholder */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-10`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className={`text-4xl font-bold bg-gradient-to-r ${config.bg} bg-clip-text text-transparent mb-2`}>
              📢
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {language === 'ar' ? 'مساحة إعلانية' : 'Ad Space'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {width} × {height}px
            </p>
          </div>
          <div className={`absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none`} />
        </>
      )}
    </div>
  );
}

// ============ Ad Layout Component ============
interface AdLayoutProps {
  children: React.ReactNode;
  showAds?: boolean;
}

export function AdLayoutEnhanced({ children, showAds = true }: AdLayoutProps) {
  if (!showAds) return <>{children}</>;

  return (
    <div className="space-y-8">
      {/* Top Banner Ad */}
      <div className="w-full flex justify-center">
        <AdSpaceEnhanced position="top" width={1200} height={90} />
      </div>

      {/* Main Content with Sidebar Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>

        {/* Sidebar Ads */}
        <div className="space-y-6">
          <AdSpaceEnhanced position="sidebar-top" width={300} height={250} />
          <AdSpaceEnhanced position="sidebar-middle" width={300} height={250} />
          <AdSpaceEnhanced position="sidebar-bottom" width={300} height={250} />
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className="w-full flex justify-center">
        <AdSpaceEnhanced position="bottom" width={1200} height={90} />
      </div>
    </div>
  );
}

// ============ Responsive Ad Component ============
export function ResponsiveAdSpaceEnhanced({ position }: { position: string }) {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  const adSizes: Record<string, { desktop: [number, number]; mobile: [number, number] }> = {
    'top': { desktop: [1200, 90], mobile: [320, 50] },
    'sidebar-top': { desktop: [300, 250], mobile: [300, 250] },
    'sidebar-middle': { desktop: [300, 250], mobile: [300, 250] },
    'sidebar-bottom': { desktop: [300, 250], mobile: [300, 250] },
    'bottom': { desktop: [1200, 90], mobile: [320, 50] }
  };

  const [width, height] = isDesktop
    ? adSizes[position]?.desktop || [300, 250]
    : adSizes[position]?.mobile || [300, 250];

  return <AdSpaceEnhanced position={position as any} width={width} height={height} />;
}

// ============ Ad Widget Component ============
interface AdWidgetProps {
  placement: string;
  className?: string;
}

export function AdWidget({ placement, className = '' }: AdWidgetProps) {
  const { data: ads = [] } = useQuery<AdData[]>({
    queryKey: [`/api/admin/ads/placement/${placement}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/admin/ads/placement/${placement}`);
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
  });

  const activeAds = ads.filter(ad => ad.active);
  if (activeAds.length === 0) return null;

  const ad = activeAds[0];

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`}
      onClick={() => {
        fetch(`/api/ads/${ad.id}/click`, { method: 'POST' }).catch(console.error);
        if (ad.url) window.open(ad.url, '_blank');
      }}
    >
      <img
        src={ad.filePath}
        alt={ad.name}
        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
    </div>
  );
}

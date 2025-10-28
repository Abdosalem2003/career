import { useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

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

export function AdSpace({ position, width = 300, height = 250, className = '' }: AdSpacesProps) {
  const { language } = useI18n();
  const [isVisible, setIsVisible] = useState(true);

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
      {/* Ad Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-10`} />

      {/* Ad Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        {/* Placeholder */}
        <div className="text-center">
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
      </div>

      {/* Border */}
      <div className={`absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none`} />

      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        aria-label="Close ad"
      >
        <X className="h-3 w-3 text-gray-600" />
      </button>
    </div>
  );
}

// ============ Ad Layout Component ============
interface AdLayoutProps {
  children: React.ReactNode;
  showAds?: boolean;
}

export function AdLayout({ children, showAds = true }: AdLayoutProps) {
  if (!showAds) return <>{children}</>;

  return (
    <div className="space-y-8">
      {/* Top Banner Ad */}
      <div className="w-full flex justify-center">
        <AdSpace position="top" width={1200} height={90} />
      </div>

      {/* Main Content with Sidebar Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>

        {/* Sidebar Ads */}
        <div className="space-y-6">
          <AdSpace position="sidebar-top" width={300} height={250} />
          <AdSpace position="sidebar-middle" width={300} height={250} />
          <AdSpace position="sidebar-bottom" width={300} height={250} />
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className="w-full flex justify-center">
        <AdSpace position="bottom" width={1200} height={90} />
      </div>
    </div>
  );
}

// ============ Responsive Ad Component ============
export function ResponsiveAdSpace({ position }: { position: string }) {
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

  return <AdSpace position={position as any} width={width} height={height} />;
}

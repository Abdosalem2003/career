import React from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { Category, SiteSettings } from "@shared/types";
import { 
  X,
  Home,
  Radio,
  Settings as SettingsIcon,
  ChevronRight,
  User,
  Mail,
  LogOut,
  TrendingUp,
  Clock,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfessionalSidebarProps {
  onClose: () => void;
}

export function ProfessionalSidebar({ onClose }: ProfessionalSidebarProps) {
  const { language } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const { data: settings = {} as SiteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const siteName = language === "ar"
    ? (settings.siteNameAr || "U.N.N.T")
    : (settings.siteNameEn || "United Nations News Today");

  const siteSubtitle = language === "ar" 
    ? (settings.siteDescriptionAr || "القائمة الرئيسية")
    : (settings.siteDescriptionEn || "Main Menu");

  // Main navigation items (only real pages)
  const mainNavItems = [
    {
      href: "/",
      icon: Home,
      label: language === "ar" ? "الرئيسية" : "Home",
      badge: null,
    },
    {
      href: "/live",
      icon: Radio,
      label: language === "ar" ? "البث المباشر" : "Live Stream",
      badge: language === "ar" ? "مباشر" : "LIVE",
      badgeColor: "bg-red-500",
    },
    {
      href: "/gold-prices",
      icon: TrendingUp,
      label: language === "ar" ? "أسعار الذهب" : "Gold Prices",
      badge: "💰",
      badgeColor: "bg-yellow-500",
    },
    {
      href: "/prayer-times",
      icon: Clock,
      label: language === "ar" ? "مواقيت الصلاة" : "Prayer Times",
      badge: "🕌",
      badgeColor: "bg-green-500",
    },
    {
      href: "/advertise",
      icon: Megaphone,
      label: language === "ar" ? "أعلن معنا" : "Advertise",
      badge: "📢",
      badgeColor: "bg-green-500",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Professional Design */}
      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-4 shadow-lg">
        {/* Close Button - Single, Clean */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 left-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Logo & Title - Enhanced Design */}
        <div className="flex flex-col items-center justify-center gap-3 mb-3">
          {settings.logo ? (
            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-xl flex-shrink-0 ring-4 ring-white/30">
              <img 
                src={settings.logo} 
                alt={siteName}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-xl flex-shrink-0 ring-4 ring-white/30">
              <span className="text-blue-600 font-bold text-3xl">
                {siteName.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-white font-black text-xl tracking-wide">{siteName}</h2>
            <p className="text-blue-100 text-sm mt-1">{siteSubtitle}</p>
          </div>
        </div>

        {/* Management Team - Modern Cards */}
        {(settings.chairmanName || settings.editorInChiefName) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-xs text-blue-100 mb-2 font-medium">{language === "ar" ? "فريق الإدارة" : "Management Team"}</p>
            <div className="flex items-center justify-end gap-2 flex-nowrap">
              {settings.chairmanName && (
                <div className="text-right bg-white/5 rounded-lg px-2 py-1 backdrop-blur-sm flex-shrink-0">
                  <p className="text-[9px] text-blue-200 font-medium leading-tight whitespace-nowrap">
                    {settings.chairmanTitle || (language === "ar" ? "رئيس مجلس الإدارة" : "Chairman")}
                  </p>
                  <p className="text-[11px] font-bold text-white leading-tight mt-0.5 whitespace-nowrap">{settings.chairmanName}</p>
                </div>
              )}
              {settings.editorInChiefName && (
                <div className="text-right bg-white/5 rounded-lg px-2 py-1 backdrop-blur-sm flex-shrink-0">
                  <p className="text-[9px] text-blue-200 font-medium leading-tight whitespace-nowrap">
                    {settings.editorInChiefTitle || (language === "ar" ? "رئيس التحرير" : "Editor in Chief")}
                  </p>
                  <p className="text-[11px] font-bold text-white leading-tight mt-0.5 whitespace-nowrap">{settings.editorInChiefName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Card - Compact - Only show if logged in */}
      {/* This section is removed - user info should come from auth context */}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="space-y-2.5">
          {mainNavItems.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              {index === 0 ? (
                // First item (Home) - Blue Gradient Card
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-16 px-6 text-white hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <span className="font-bold text-lg">{item.label}</span>
                    <item.icon className="h-6 w-6" />
                  </Button>
                </div>
              ) : (
                // Other items - Clean White Cards
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 hover:scale-[1.01]">
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-14 px-5 text-gray-700 hover:bg-blue-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge className={`${item.badgeColor || "bg-red-500"} text-white text-xs px-2.5 py-1 font-bold rounded-lg shadow-sm`}>
                          {item.badge}
                        </Badge>
                      )}
                      <item.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Button>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <>
            <div className="mt-6 px-2">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 px-3">
                {language === "ar" ? "التصنيفات" : "Categories"}
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/category/${category.slug}`}
                    onClick={onClose}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-10 px-4 text-gray-700 hover:bg-white hover:text-blue-600 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="font-medium text-sm">
                          {language === "ar" ? category.nameAr : category.nameEn}
                        </span>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>


      {/* Footer */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        {/* Admin Panel Button - Only visible when logged in */}
        {isLoggedIn && (
          <Link href="/dash-unnt-2025" onClick={onClose}>
            <Button 
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11 font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>{language === "ar" ? "لوحة التحكم" : "Admin Panel"}</span>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Logout Button - Only visible when logged in */}
        {isLoggedIn && (
          <Button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              setIsLoggedIn(false);
              window.location.href = '/';
            }}
            className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11 font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        
        <p className="text-xs text-gray-400 text-center pt-2">
          © 2024 {siteName}
        </p>
      </div>
    </div>
  );
}

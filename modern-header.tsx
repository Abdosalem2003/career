import { Link } from "wouter";
import { 
  Search, Menu, Moon, Sun, Globe, X, 
  Home, Radio, Info, Phone, Settings,
  User, Bell, ChevronRight, LogOut
} from "lucide-react";
import { useAuth } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings, Category } from "@shared/types";
import { Logo } from "@/components/logo";
import { useLocation } from "wouter";

export function ModernHeader() {
  const { language, setLanguage, t, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const { data: settings = {} as SiteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const siteName = language === "ar"
    ? (settings.siteNameAr || "U.N.N.T")
    : (settings.siteNameEn || "United Nations News Today");
  
  const siteSubtitle = language === "ar" 
    ? (settings.siteDescriptionAr || "أخبار الأمم المتحدة اليوم")
    : (settings.siteDescriptionEn || "United Nations News Today");

  return (
    <>
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Logo and Title - Moved to Right */}
            <Link href="/">
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                {/* Logo Image or Default - Bigger size */}
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt={siteName}
                    className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                  />
                ) : (
                  <Logo 
                    className="h-12 w-12 sm:h-14 sm:w-14" 
                    variant="blue" 
                    showText={false}
                    textSize="md"
                  />
                )}
                {/* Site Name - Always visible - Bigger text */}
                <div className="text-right flex-1 min-w-0">
                  <div className="text-blue-600 font-bold text-lg sm:text-2xl leading-tight tracking-wide truncate">
                    {siteName}
                  </div>
                  <div className="text-gray-900 text-xs sm:text-sm font-medium truncate">
                    {siteSubtitle}
                  </div>
                </div>
              </div>
            </Link>

            {/* Mobile Menu Button - Moved to Left */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={dir === "rtl" ? "right" : "left"} 
                className="w-80 p-0 bg-white"
              >
                <ModernSidebar 
                  categories={categories} 
                  language={language}
                  siteName={siteName}
                  siteSubtitle={siteSubtitle}
                  settings={settings}
                  onClose={() => setSidebarOpen(false)}
                />
              </SheetContent>
            </Sheet>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input
                  type="search"
                  placeholder={language === "ar" ? "ابحث..." : "Search..."}
                  className={`${dir === "rtl" ? "pr-10" : "pl-10"} h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100 relative h-9 w-9 sm:h-10 sm:w-10"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-700 hover:bg-gray-100 hidden sm:flex h-10 w-10"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="text-gray-700 hover:bg-gray-100 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* User Avatar */}
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs sm:text-sm">
                  {language === "ar" ? "ع" : "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="pb-4 md:hidden animate-in slide-in-from-top-2">
              <div className="relative">
                <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                <Input
                  type="search"
                  placeholder={language === "ar" ? "ابحث..." : "Search..."}
                  className={`${dir === "rtl" ? "pr-10" : "pl-10"} h-10 bg-gray-50 border-gray-200`}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

// Modern Sidebar Component
function ModernSidebar({ 
  categories, 
  language, 
  siteName, 
  siteSubtitle,
  settings,
  onClose 
}: { 
  categories: Category[]; 
  language: string;
  siteName: string;
  siteSubtitle: string;
  settings: SiteSettings;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 p-6 relative">
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white hover:bg-blue-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </SheetClose>
        
        <div className="flex items-center gap-3 mt-8">
          {/* Logo Image or Default */}
          {settings.logo ? (
            <img 
              src={settings.logo} 
              alt={siteName}
              className="h-14 w-14 object-contain bg-white/10 rounded-lg p-2"
            />
          ) : (
            <Logo 
              className="h-14 w-14" 
              variant="white" 
              showText={false}
              textSize="lg"
            />
          )}
          {/* Site Name */}
          <div className="text-right flex-1">
            <div className="text-white font-bold text-xl tracking-wide">{siteName}</div>
            <div className="text-white/90 text-xs font-medium">{siteSubtitle}</div>
          </div>
        </div>

        {/* Admin User Info - يظهر فقط للمستخدمين المسجلين */}
        {isAuthenticated && user && (
          <div className="mt-6 space-y-3">
            {/* User Info Card */}
            <div className="bg-blue-500/50 backdrop-blur rounded-lg p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-purple-500 text-white font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">
                  {user.name}
                </div>
                <div className="text-white/80 text-xs">{user.email}</div>
              </div>
            </div>
            
            {/* Admin Actions */}
            <div className="space-y-2">
              <Link href="/dash-unnt-2025" onClick={onClose}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white rounded-xl font-semibold"
                >
                  <Settings className="h-5 w-5 ml-3" />
                  <span className="flex-1 text-right">{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full justify-start h-11 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl font-semibold"
              >
                <LogOut className="h-5 w-5 ml-3" />
                <span className="flex-1 text-right">{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Main Menu */}
        <div className="space-y-1">
          <Link href="/" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold shadow-sm"
            >
              <Home className="h-5 w-5 ml-3" />
              <span className="flex-1 text-right">{language === "ar" ? "الرئيسية" : "Home"}</span>
            </Button>
          </Link>

          <Link href="/live" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-gray-50 rounded-xl"
            >
              <Radio className="h-5 w-5 ml-3 text-gray-600" />
              <span className="flex-1 text-right text-gray-700">
                {language === "ar" ? "البث المباشر" : "Live Stream"}
              </span>
              <Badge variant="destructive" className="mr-2">
                {language === "ar" ? "مباشر" : "Live"}
              </Badge>
            </Button>
          </Link>

          <Link href="/about" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-gray-50 rounded-xl"
            >
              <Info className="h-5 w-5 ml-3 text-gray-600" />
              <span className="flex-1 text-right text-gray-700">
                {language === "ar" ? "من نحن" : "About Us"}
              </span>
            </Button>
          </Link>

          <Link href="/contact" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-gray-50 rounded-xl"
            >
              <Phone className="h-5 w-5 ml-3 text-gray-600" />
              <span className="flex-1 text-right text-gray-700">
                {language === "ar" ? "اتصل بنا" : "Contact Us"}
              </span>
            </Button>
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Categories Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 px-3 mb-3">
            {language === "ar" ? "التصنيفات" : "Categories"}
          </h3>
          
          {categories.slice(0, 6).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 hover:bg-gray-50 rounded-lg group"
              >
                <div className="h-2 w-2 rounded-full bg-blue-600 ml-3"></div>
                <span className="flex-1 text-right text-gray-700 text-sm">
                  {language === "ar" ? category.nameAr : category.nameEn}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <Link href="/dash-unnt-2025" onClick={onClose}>
          <Button
            variant="outline"
            className="w-full justify-start h-10 rounded-lg border-gray-200 hover:bg-white"
          >
            <Settings className="h-4 w-4 ml-3" />
            <span className="flex-1 text-right text-sm">
              {language === "ar" ? "لوحة التحكم" : "Dashboard"}
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

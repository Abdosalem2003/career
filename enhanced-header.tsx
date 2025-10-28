import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { useQuery } from "@tanstack/react-query";
import type { Category, SiteSettings } from "@shared/types";
import { 
  Search, 
  Menu,
  Globe,
  ChevronDown,
  Calendar,
  Megaphone,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ProfessionalSidebar } from "@/components/professional-sidebar";
import { PrayerBar } from "@/components/prayer-bar";
import { ModernSearch } from "@/components/modern-search";

export function EnhancedHeader() {
  const { language, setLanguage, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const topCategories = categories.slice(0, 7);

  // Get current date
  const currentDate = new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <PrayerBar />
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
        {/* Top Bar - Minimal & Clean */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex h-9 items-center justify-between text-xs">
              {/* Date */}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{currentDate}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600"
                  title={theme === "dark" ? (language === "ar" ? "الوضع النهاري" : "Light Mode") : (language === "ar" ? "الوضع الليلي" : "Dark Mode")}
                >
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
                
                {/* Language */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                  className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600"
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  {language === "ar" ? "EN" : "عربي"}
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Main Header - Compact & Modern */}
      <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Logo & Brand */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt={siteName}
                    className="h-12 w-12 object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                    <span className="text-white font-bold text-lg">
                      {siteName.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                    {siteName}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">
                    {siteSubtitle}
                  </p>
                </div>
              </div>
            </Link>

            {/* Modern Search - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <ModernSearch />
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-700 hover:bg-gray-100"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-80 p-0">
                  <ProfessionalSidebar onClose={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Modern Search */}
          {searchOpen && (
            <div className="pb-4 lg:hidden px-4">
              <ModernSearch />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar - Clean & Modern */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-4">
          <nav className="flex items-center justify-center gap-1 py-2">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-5 h-10 rounded-lg transition-colors"
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Button>
            </Link>
            
            <Link href="/live">
              <Button 
                variant="ghost" 
                className="relative text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-bold px-5 h-10 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  {language === "ar" ? "البث المباشر" : "Live Stream"}
                </span>
              </Button>
            </Link>
            
            <Link href="/gold-prices">
              <Button 
                variant="ghost" 
                className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 font-medium px-5 h-10 rounded-lg transition-colors"
              >
                💰 {language === "ar" ? "أسعار الذهب" : "Gold Prices"}
              </Button>
            </Link>
            
            <Link href="/prayer-times">
              <Button 
                variant="ghost" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium px-5 h-10 rounded-lg transition-colors"
              >
                🕌 {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
              </Button>
            </Link>
            
            <Link href="/advertise">
              <Button 
                variant="ghost" 
                className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold px-5 h-10 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                {language === "ar" ? "أعلن معنا" : "Advertise"}
              </Button>
            </Link>

            {topCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-5 h-10 rounded-lg transition-colors"
                >
                  {language === "ar" ? category.nameAr : category.nameEn}
                </Button>
              </Link>
            ))}

            {categories.length > 7 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-5 h-10 rounded-lg transition-colors"
                  >
                    {language === "ar" ? "المزيد" : "More"}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {categories.slice(7).map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link href={`/category/${category.slug}`} className="cursor-pointer">
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
    </>
  );
}

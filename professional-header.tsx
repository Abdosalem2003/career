import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { useQuery } from "@tanstack/react-query";
import type { Category, SiteSettings } from "@shared/types";
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvancedSearch } from "@/components/advanced-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ProfessionalSidebar } from "@/components/professional-sidebar";

export function ProfessionalHeader() {
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

  const topCategories = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-colors duration-300">
      {/* Top Bar */}
      <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-10 items-center justify-between text-white text-sm">
            {/* Date & Time */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="h-8 text-white hover:bg-white/20"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === "ar" ? "EN" : "عربي"}
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 text-white hover:bg-white/20 transition-all"
                title={theme === "dark" ? (language === "ar" ? "الوضع النهاري" : "Light Mode") : (language === "ar" ? "الوضع الليلي" : "Dark Mode")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-white hover:bg-white/20 relative"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                  3
                </Badge>
              </Button>

              {/* User */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-white hover:bg-white/20"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              {/* Logo */}
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={siteName}
                  className="h-14 w-14 object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
                  {siteName.charAt(0)}
                </div>
              )}
              
              {/* Brand Text */}
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                  {siteName}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {siteSubtitle}
                </p>
              </div>
            </div>
          </Link>

          {/* Advanced Search - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            <AdvancedSearch />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-700 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu */}
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

        {/* Mobile Advanced Search */}
        {searchOpen && (
          <div className="pb-4 lg:hidden">
            <AdvancedSearch autoFocus onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="hidden lg:block border-t bg-gray-50/50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-4">
          <nav className="flex items-center justify-center gap-1 py-3">
            {/* Home */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-4 transition-colors"
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Button>
            </Link>

            {/* Live Stream - Mobile */}
            <Link href="/live">
              <Button 
                variant="ghost" 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold px-4 flex items-center gap-2 transition-colors"
              >
                <Radio className="h-4 w-4 fill-red-600 dark:fill-red-400" />
                {language === "ar" ? "البث" : "Live"}
              </Button>
            </Link>

            {/* Categories */}
            {topCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-4 transition-colors"
                >
                  {language === "ar" ? category.nameAr : category.nameEn}
                </Button>
              </Link>
            ))}

            {/* Live Stream */}
            <Link href="/live">
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-4 flex items-center gap-2 animate-pulse"
              >
                <Radio className="h-4 w-4 fill-red-600" />
                {language === "ar" ? "البث المباشر" : "Live"}
              </Button>
            </Link>

            {/* More Dropdown */}
            {categories.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4"
                  >
                    {language === "ar" ? "المزيد" : "More"}
                    <ChevronDown className="h-4 w-4 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {categories.slice(6).map((category) => (
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
  );
}

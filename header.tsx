import { Link } from "wouter";
import { Search, Menu, Moon, Sun, Globe, ChevronDown, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings, Category } from "@shared/types";
import { Logo } from "@/components/logo";
import { PrayerBar } from "@/components/prayer-bar";

export function Header() {
  const { language, setLanguage, t, dir } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: settings = {} as SiteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const siteName = language === "ar" 
    ? (settings.siteNameAr || "Ø£Ø®Ø¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ…") 
    : (settings.siteNameEn || "Today's News");

  return (
    <>
      {/* Prayer Bar */}
      <PrayerBar />
      
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-gray-900/95">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <div data-testid="link-home" className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 -mx-3 cursor-pointer">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={siteName} 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain" 
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">N</span>
                </div>
              )}
              <span className="text-xl font-bold hidden sm:inline-block text-gray-900 dark:text-white">
                {siteName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Categories */}
          <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
            <Link href="/" data-testid="link-home-nav">
              <Button variant="ghost" size="sm" className="hover-elevate">
                {t("header.home")}
              </Button>
            </Link>
            
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover-elevate">
                  {t("header.categories")}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === "rtl" ? "end" : "start"} className="w-56 dark:bg-gray-800 dark:border-gray-700">
                {categories.map((category: any) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/category/${category.slug}`}>
                      <span className="cursor-pointer w-full">
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/categories">
                    <span className="cursor-pointer w-full font-semibold">
                      {language === "ar" ? "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…" : "All Categories"}
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/live" data-testid="link-live">
              <Button variant="ghost" size="sm" className="hover-elevate">
                {t("header.live")}
              </Button>
            </Link>
            <Link href="/advertise" data-testid="link-advertise">
              <Button variant="ghost" size="sm" className="hover-elevate bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 border border-blue-200 dark:border-blue-800 shadow-sm">
                <Megaphone className="h-4 w-4 mr-1" />
                {t("header.advertise")}
              </Button>
            </Link>
            <Link href="/dash-unnt-2025" data-testid="link-admin">
              <Button variant="ghost" size="sm" className="hover-elevate">
                {t("header.admin")}
              </Button>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                data-testid="input-search"
                type="search"
                placeholder={t("header.search")}
                className={`${dir === "rtl" ? "pr-10" : "pl-10"} h-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              data-testid="button-mobile-search"
              variant="ghost"
              size="icon"
              className="lg:hidden hover-elevate"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-testid="button-language-toggle" variant="ghost" size="icon" className="hover-elevate">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem
                  data-testid="menu-item-english"
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-accent" : ""}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="menu-item-arabic"
                  onClick={() => setLanguage("ar")}
                  className={language === "ar" ? "bg-accent" : ""}
                >
                  Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              data-testid="button-theme-toggle"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-elevate"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  data-testid="button-mobile-menu"
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover-elevate"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === "rtl" ? "left" : "right"} className="dark:bg-gray-900 dark:border-gray-700">
                <nav className="flex flex-col gap-4 mt-8" data-testid="nav-mobile">
                  <Link href="/" data-testid="mobile-link-home">
                    <Button variant="ghost" className="w-full justify-start hover-elevate" size="lg">
                      {t("header.home")}
                    </Button>
                  </Link>
                  
                  <div className="space-y-2">
                    <p className="px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {t("header.categories")}
                    </p>
                    {categories.map((category: any) => (
                      <Link key={category.id} href={`/category/${category.slug}`}>
                        <Button variant="ghost" className="w-full justify-start hover-elevate" size="lg">
                          {language === "ar" ? category.nameAr : category.nameEn}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <Link href="/live" data-testid="mobile-link-live">
                    <Button variant="ghost" className="w-full justify-start hover-elevate" size="lg">
                      {t("header.live")}
                    </Button>
                  </Link>
                  <Link href="/advertise" data-testid="mobile-link-advertise">
                    <Button variant="ghost" className="w-full justify-start hover-elevate bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 shadow-sm" size="lg">
                      <Megaphone className="h-5 w-5 mr-2" />
                      {t("header.advertise")}
                    </Button>
                  </Link>
                  <Link href="/dash-unnt-2025" data-testid="mobile-link-admin">
                    <Button variant="ghost" className="w-full justify-start hover-elevate" size="lg">
                      {t("header.admin")}
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="pb-4 lg:hidden animate-in slide-in-from-top-2">
            <div className="relative">
              <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                data-testid="input-mobile-search"
                type="search"
                placeholder={t("header.search")}
                className={`${dir === "rtl" ? "pr-10" : "pl-10"} h-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
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

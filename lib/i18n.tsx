import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.home": "Home",
    "header.categories": "Categories",
    "header.live": "Live",
    "header.advertise": "Advertise",
    "header.search": "Search articles...",
    "header.admin": "Admin",
    "header.login": "Login",
    "header.logout": "Logout",
    
    // Footer
    "footer.about": "About Us",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.newsletter": "Subscribe to Newsletter",
    "footer.email": "Your email",
    "footer.subscribe": "Subscribe",
    "footer.sitemap": "Sitemap",
    "footer.follow": "Follow Us",
    
    // Homepage
    "home.featured": "Featured News",
    "home.trending": "Trending",
    "home.latest": "Latest Articles",
    "home.mostRead": "Most Read",
    "home.categories": "Browse by Category",
    
    // Article
    "article.by": "By",
    "article.readTime": "min read",
    "article.views": "views",
    "article.relatedNews": "Related News",
    "article.share": "Share Article",
    "article.published": "Published",
    "article.updated": "Updated",
    
    // Admin
    "admin.dashboard": "Dashboard",
    "admin.articles": "Articles",
    "admin.categories": "Categories",
    "admin.users": "Users",
    "admin.media": "Media Library",
    "admin.ads": "Advertisements",
    "admin.streams": "Live Streams",
    "admin.settings": "Settings",
    "admin.auditLogs": "Audit Logs",
    "admin.analytics": "Analytics",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sortBy": "Sort by",
    "common.viewAll": "View All",
    "common.readMore": "Read More",
    "common.advertisement": "Advertisement",
  },
  ar: {
    // Header
    "header.home": "الرئيسية",
    "header.categories": "الأقسام",
    "header.live": "البث المباشر",
    "header.advertise": "أعلن معنا",
    "header.search": "ابحث عن مقالات...",
    "header.admin": "لوحة التحكم",
    "header.login": "تسجيل الدخول",
    "header.logout": "تسجيل الخروج",
    
    // Footer
    "footer.about": "من نحن",
    "footer.contact": "اتصل بنا",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الاستخدام",
    "footer.newsletter": "اشترك في النشرة الإخبارية",
    "footer.email": "بريدك الإلكتروني",
    "footer.subscribe": "اشترك",
    "footer.sitemap": "خريطة الموقع",
    "footer.follow": "تابعنا",
    
    // Homepage
    "home.featured": "الأخبار المميزة",
    "home.trending": "الأكثر تداولاً",
    "home.latest": "آخر المقالات",
    "home.mostRead": "الأكثر قراءة",
    "home.categories": "تصفح حسب القسم",
    
    // Article
    "article.by": "بقلم",
    "article.readTime": "دقيقة قراءة",
    "article.views": "مشاهدة",
    "article.relatedNews": "أخبار ذات صلة",
    "article.share": "شارك المقال",
    "article.published": "نُشر في",
    "article.updated": "آخر تحديث",
    
    // Admin
    "admin.dashboard": "لوحة التحكم",
    "admin.articles": "المقالات",
    "admin.categories": "الأقسام",
    "admin.users": "المستخدمون",
    "admin.media": "مكتبة الوسائط",
    "admin.ads": "الإعلانات",
    "admin.streams": "البث المباشر",
    "admin.settings": "الإعدادات",
    "admin.auditLogs": "سجل النشاطات",
    "admin.analytics": "الإحصائيات",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.create": "إنشاء",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.sortBy": "ترتيب حسب",
    "common.viewAll": "عرض الكل",
    "common.readMore": "اقرأ المزيد",
    "common.advertisement": "إعلان",
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("language");
    if (saved) {
      return saved as Language;
    }
    
    // Auto-detect browser language
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      // Check if browser language is Arabic
      if (browserLang.startsWith('ar')) {
        return "ar";
      }
      // Default to English for other languages
      return "en";
    }
    
    // Fallback to Arabic
    return "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    // Add body class for language-specific styling
    document.body.classList.remove('lang-ar', 'lang-en');
    document.body.classList.add(`lang-${lang}`);
  };

  useEffect(() => {
    // Apply language settings on mount and change
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.remove('lang-ar', 'lang-en');
    document.body.classList.add(`lang-${language}`);
    
    // Update meta tags for better SEO
    const metaLang = document.querySelector('meta[http-equiv="content-language"]');
    if (metaLang) {
      metaLang.setAttribute('content', language);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'content-language');
      meta.setAttribute('content', language);
      document.head.appendChild(meta);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

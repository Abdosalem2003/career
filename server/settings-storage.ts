import { randomUUID } from "crypto";
import type { SiteSettings } from "@shared/types";

export interface ISettingsStorage {
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  getSetting(key: string): Promise<any>;
  setSetting(key: string, value: any): Promise<void>;
}

export class MemSettingsStorage implements ISettingsStorage {
  private settings: SiteSettings;

  constructor() {
    // Default settings
    this.settings = {
      // General Settings
      siteNameAr: "U.N.N.T",
      siteNameEn: "United Nations News Today",
      siteDescriptionAr: "أخبار الأمم المتحدة اليوم",
      siteDescriptionEn: "United Nations News Today",
      logo: undefined,
      favicon: undefined,
      contactEmail: "contact@unnt.news",
      phone: "+966 xx xxx xxxx",
      description: "منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية على مدار الساعة",
      maintenanceMode: false,
      maintenanceMessage: "الموقع تحت الصيانة حالياً. سنعود قريباً.",
      
      // Appearance Settings
      darkMode: false,
      autoRTL: true,
      primaryColor: "#2563eb",
      fontFamily: "Cairo, Inter, system-ui",
      breakingNewsTicker: true,
      
      // SEO Settings
      seoTitle: "U.N.N.T - أخبار الأمم المتحدة اليوم",
      seoDescription: "منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية",
      keywords: "أخبار, الأمم المتحدة, أخبار عالمية, تقارير",
      ogImage: undefined,
      autoSitemap: true,
      enableAMP: false,
      
      // Email Settings
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUsername: "noreply@unnt.news",
      smtpPassword: "",
      newArticleNotifications: true,
      weeklyNewsletter: true,
      
      // Security Settings
      twoFactorAuth: false,
      botProtection: true,
      maxLoginAttempts: "5",
      sessionTimeout: "30",
      ipLogging: true,
      
      // Performance Settings
      enableCaching: true,
      autoImageCompression: true,
      lazyLoadImages: true,
      cdnEnabled: false,
      cdnUrl: "",
      
      // Notification Settings
      browserNotifications: true,
      commentNotifications: true,
      pendingArticleNotifications: true,
      
      // Advanced Settings
      developerMode: false,
      errorLogging: true,
      apiRateLimit: "100",
      customCSS: "",
      customJS: "",
      googleAnalyticsId: "",
      facebookPixelId: "",
      
      // Management Team
      chairmanName: "د. محمد أحمد",
      chairmanTitle: "رئيس مجلس الإدارة",
      editorInChiefName: "أ. عبدالرحمن سالم",
      editorInChiefTitle: "رئيس التحرير",
    };
  }

  async getSettings(): Promise<SiteSettings> {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }

  async getSetting(key: string): Promise<any> {
    return (this.settings as any)[key];
  }

  async setSetting(key: string, value: any): Promise<void> {
    (this.settings as any)[key] = value;
  }
}

export const settingsStorage = new MemSettingsStorage();

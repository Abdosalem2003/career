import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { Category, SiteSettings } from "@shared/types";
import { 
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
  Music,
  Github,
  Camera,
  MessageSquare,
  Disc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function ModernFooter() {
  const { language, dir } = useI18n();

  const { data: settings = {} as SiteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const siteName = language === "ar"
    ? (settings.siteNameAr || "U.N.N.T")
    : (settings.siteNameEn || "United Nations News Today");

  const topCategories = categories.slice(0, 6);

  // Social media links with vibrant colors
  const socialLinks = [
    { 
      icon: Facebook, 
      href: settings.facebookUrl || "#", 
      label: "Facebook",
      color: "hover:bg-blue-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Twitter, 
      href: settings.twitterUrl || "#", 
      label: "Twitter",
      color: "hover:bg-sky-500",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Instagram, 
      href: settings.instagramUrl || "#", 
      label: "Instagram",
      color: "hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Youtube, 
      href: settings.youtubeUrl || "#", 
      label: "YouTube",
      color: "hover:bg-red-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Linkedin, 
      href: settings.linkedinUrl || "#", 
      label: "LinkedIn",
      color: "hover:bg-blue-700",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: MessageCircle, 
      href: settings.whatsappUrl || "#", 
      label: "WhatsApp",
      color: "hover:bg-green-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Send, 
      href: settings.telegramUrl || "#", 
      label: "Telegram",
      color: "hover:bg-blue-500",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Music, 
      href: settings.tiktokUrl || "#", 
      label: "TikTok",
      color: "hover:bg-black",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Github, 
      href: settings.githubUrl || "#", 
      label: "GitHub",
      color: "hover:bg-gray-800",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Camera, 
      href: settings.snapchatUrl || "#", 
      label: "Snapchat",
      color: "hover:bg-yellow-400",
      iconColor: "group-hover:text-black"
    },
    { 
      icon: MessageSquare, 
      href: settings.pinterestUrl || "#", 
      label: "Pinterest",
      color: "hover:bg-red-700",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: MessageCircle, 
      href: settings.redditUrl || "#", 
      label: "Reddit",
      color: "hover:bg-orange-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Disc, 
      href: settings.discordUrl || "#", 
      label: "Discord",
      color: "hover:bg-indigo-600",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Mail, 
      href: settings.emailUrl ? `mailto:${settings.emailUrl}` : "#", 
      label: "Email",
      color: "hover:bg-gray-700",
      iconColor: "group-hover:text-white"
    },
    { 
      icon: Phone, 
      href: settings.phoneUrl ? `tel:${settings.phoneUrl}` : "#", 
      label: "Phone",
      color: "hover:bg-green-700",
      iconColor: "group-hover:text-white"
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 mt-20">
      {/* Main Footer Content */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={siteName} 
                  className="h-16 w-16 object-contain mb-4 bg-white/10 rounded-lg p-2" 
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-2xl">
                    {siteName.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-white font-bold text-xl mb-2">{siteName}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {language === "ar" 
                  ? (settings.footerDescriptionAr || settings.description || "منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية على مدار الساعة")
                  : (settings.footerDescriptionEn || settings.description || "Professional news platform providing latest news and exclusive reports 24/7")
                }
              </p>
            </div>

            {/* Social Media - Vibrant Icons */}
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.filter(social => social.href && social.href !== "#").map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-lg`}
                >
                  <social.icon className={`h-5 w-5 text-gray-400 transition-colors ${social.iconColor}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-blue-500" />
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {language === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {language === "ar" ? "البث المباشر" : "Live Stream"}
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  📢 {language === "ar" ? "أعلن معنا" : "Advertise"}
                </Link>
              </li>
              <li>
                <Link href="/gold-prices" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  💰 {language === "ar" ? "أسعار الذهب" : "Gold Prices"}
                </Link>
              </li>
              <li>
                <Link href="/prayer-times" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🕌 {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-blue-500" />
              {language === "ar" ? "التصنيفات" : "Categories"}
            </h4>
            <ul className="space-y-3">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {language === "ar" ? category.nameAr : category.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-blue-500" />
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h4>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              {settings.contactEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                    {settings.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-white font-medium text-sm mb-3">
                {language === "ar" ? "اشترك في النشرة الإخبارية" : "Subscribe to Newsletter"}
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={language === "ar" ? "بريدك الإلكتروني" : "Your email"}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-10 text-sm"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-4 text-sm">
                  {language === "ar" ? "اشترك" : "Subscribe"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Management Team Section */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-end gap-4 text-right">
          {settings.chairmanName && (
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">
                {settings.chairmanTitle || (language === "ar" ? "رئيس مجلس الإدارة" : "Chairman")}
              </p>
              <p className="text-white font-bold text-sm">{settings.chairmanName}</p>
            </div>
          )}
          {settings.editorInChiefName && (
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">
                {settings.editorInChiefTitle || (language === "ar" ? "رئيس التحرير" : "Editor in Chief")}
              </p>
              <p className="text-white font-bold text-sm">{settings.editorInChiefName}</p>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              {language === "ar" 
                ? (settings.copyrightTextAr || "© 2025 أخبار اليوم. جميع الحقوق محفوظة")
                : (settings.copyrightTextEn || "© 2025 United Nations News Today. All rights reserved")
              }
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              {settings.designerCompanyUrl && settings.designerCompanyName ? (
                <>
                  {language === "ar" ? "صنع بواسطة:" : "Made by:"}{" "}
                  <a 
                    href={settings.designerCompanyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline font-medium"
                  >
                    {settings.designerCompanyName}
                  </a>
                </>
              ) : (
                <>
                  {language === "ar"
                    ? (settings.madeWithLoveTextAr || <>صُنع بـ <span className="text-red-500">❤️</span> في السعودية</>)
                    : (settings.madeWithLoveTextEn || <>Made with <span className="text-red-500">❤️</span> in Saudi Arabia</>)
                  }
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

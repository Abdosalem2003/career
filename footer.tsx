import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, MessageCircle, Send, Music, Github, Camera, MessageSquare, Disc, Phone, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings, Category } from "@shared/types";
import { Logo } from "@/components/logo";

export function Footer() {
  const { t, dir, language } = useI18n();

  const { data: settings = {} as SiteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: categories = [] as Category[] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const siteName = language === "ar" 
    ? (settings.siteNameAr || "أخبار اليوم") 
    : (settings.siteNameEn || "Today's News");

  return (
    <footer className="border-t bg-card mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={siteName} 
                  className="h-12 w-12 object-contain" 
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">N</span>
                </div>
              )}
              <div>
                <div className="font-bold text-lg">{siteName}</div>
                <div className="text-sm text-muted-foreground">
                  {language === "ar" ? "أخبار الأمم المتحدة اليوم" : "United Nations News Today"}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.description || (dir === "rtl" 
                ? "منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية على مدار الساعة"
                : "Professional news platform providing latest news and exclusive reports 24/7"
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.sitemap")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" data-testid="footer-link-home">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    {t("header.home")}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/categories" data-testid="footer-link-categories">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    {t("header.categories")}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/advertise" data-testid="footer-link-advertise">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                    <Megaphone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t("header.advertise")}</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/live" data-testid="footer-link-live">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    {t("header.live")}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-2">
              {settings.contactEmail && (
                <li className="text-sm text-muted-foreground">
                  {settings.contactEmail}
                </li>
              )}
              {settings.phone && (
                <li className="text-sm text-muted-foreground">
                  {settings.phone}
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.newsletter")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dir === "rtl"
                ? "اشترك للحصول على آخر الأخبار"
                : "Subscribe to get latest news"
              }
            </p>
            <div className="flex gap-2">
              <Input
                data-testid="input-newsletter-email"
                type="email"
                placeholder={t("footer.email")}
                className="h-9"
              />
              <Button data-testid="button-newsletter-subscribe" size="sm" className="hover-elevate active-elevate-2">
                {t("footer.subscribe")}
              </Button>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{t("footer.follow")}</span>
            <div className="flex gap-2">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-facebook" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-twitter" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-instagram" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-youtube" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Youtube className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-linkedin" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-whatsapp" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.telegramUrl && (
                <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-telegram" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Send className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-tiktok" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Music className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.githubUrl && (
                <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-github" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.snapchatUrl && (
                <a href={settings.snapchatUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-snapchat" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Camera className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.pinterestUrl && (
                <a href={settings.pinterestUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-pinterest" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.redditUrl && (
                <a href={settings.redditUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-reddit" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.discordUrl && (
                <a href={settings.discordUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-social-discord" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Disc className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.emailUrl && (
                <a href={`mailto:${settings.emailUrl}`}>
                  <Button data-testid="button-social-email" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Mail className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings.phoneUrl && (
                <a href={`tel:${settings.phoneUrl}`}>
                  <Button data-testid="button-social-phone" variant="ghost" size="icon" className="h-8 w-8 hover-elevate">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 {siteName}. {dir === "rtl" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>
        </div>
      </div>
    </footer>
  );
}

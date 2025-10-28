import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import type { SiteSettings } from '@shared/types';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  MessageCircle,
  Send,
  Music,
  Github,
  Mail,
  Phone,
  Camera,
  Pin,
  MessageSquare,
  Gamepad2
} from 'lucide-react';

interface SocialFollowProps {
  className?: string;
}

interface SocialLink {
  name: string;
  nameAr: string;
  url: string;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
}

export function SocialFollow({ className }: SocialFollowProps) {
  const { language } = useI18n();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  // عرض loader أثناء التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  // تحديد الروابط المتاحة مع الأيقونات والألوان
  const socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      nameAr: 'فيسبوك',
      url: settings.facebookUrl || '',
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      nameAr: 'تويتر',
      url: settings.twitterUrl || '',
      icon: Twitter,
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600'
    },
    {
      name: 'Instagram',
      nameAr: 'إنستجرام',
      url: settings.instagramUrl || '',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500',
      hoverColor: 'hover:scale-110'
    },
    {
      name: 'YouTube',
      nameAr: 'يوتيوب',
      url: settings.youtubeUrl || '',
      icon: Youtube,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    },
    {
      name: 'LinkedIn',
      nameAr: 'لينكد إن',
      url: settings.linkedinUrl || '',
      icon: Linkedin,
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800'
    },
    {
      name: 'WhatsApp',
      nameAr: 'واتساب',
      url: settings.whatsappUrl || '',
      icon: MessageCircle,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'Telegram',
      nameAr: 'تيليجرام',
      url: settings.telegramUrl || '',
      icon: Send,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      name: 'TikTok',
      nameAr: 'تيك توك',
      url: settings.tiktokUrl || '',
      icon: Music,
      color: 'bg-black dark:bg-white',
      hoverColor: 'hover:bg-gray-800 dark:hover:bg-gray-200'
    },
    {
      name: 'Snapchat',
      nameAr: 'سناب شات',
      url: settings.snapchatUrl || '',
      icon: Camera,
      color: 'bg-yellow-400',
      hoverColor: 'hover:bg-yellow-500'
    },
    {
      name: 'Pinterest',
      nameAr: 'بينترست',
      url: settings.pinterestUrl || '',
      icon: Pin,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    },
    {
      name: 'Reddit',
      nameAr: 'ريديت',
      url: settings.redditUrl || '',
      icon: MessageSquare,
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    },
    {
      name: 'Discord',
      nameAr: 'ديسكورد',
      url: settings.discordUrl || '',
      icon: Gamepad2,
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    },
    {
      name: 'GitHub',
      nameAr: 'جيت هاب',
      url: settings.githubUrl || '',
      icon: Github,
      color: 'bg-gray-800 dark:bg-gray-700',
      hoverColor: 'hover:bg-gray-900 dark:hover:bg-gray-600'
    },
    {
      name: 'Email',
      nameAr: 'البريد الإلكتروني',
      url: settings.emailUrl || '',
      icon: Mail,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      name: 'Phone',
      nameAr: 'الهاتف',
      url: settings.phoneUrl || '',
      icon: Phone,
      color: 'bg-teal-600',
      hoverColor: 'hover:bg-teal-700'
    }
  ];

  // فلترة الروابط المتاحة فقط
  const availableLinks = socialLinks.filter(link => {
    const hasUrl = link.url && link.url.trim() !== '';
    return hasUrl;
  });

  // إذا لم يكن هناك روابط، لا نعرض شيء
  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative my-4', className)}>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border border-blue-200/30 dark:border-blue-800/30 p-4 shadow-sm">

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'تابعنا على صفحاتنا' : 'Follow Us On'}
            </h3>
          </div>

          {/* Social Icons Grid */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            {availableLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative flex items-center justify-center w-10 h-10 rounded-lg shadow-sm transition-all duration-200 hover:scale-105',
                    social.color,
                    social.hoverColor
                  )}
                  title={language === 'ar' ? social.nameAr : social.name}
                >
                  <Icon className="h-5 w-5 text-white" />
                  
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

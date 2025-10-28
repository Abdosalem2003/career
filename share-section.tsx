import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface ShareSectionProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const socialPlatforms = [
  {
    name: 'Facebook',
    icon: Facebook,
    getUrl: (url: string, title: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Twitter',
    icon: Twitter,
    getUrl: (url: string, title: string) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    getUrl: (url: string, title: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export function ShareSection({ url, title, description, className }: ShareSectionProps) {
  const { language } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    const shareUrl = platform.getUrl(url, title);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3 py-3 border-y border-border/50', className)}>
      {/* Share Icon & Text */}
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {language === 'ar' ? 'شارك' : 'Share'}
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Social Buttons */}
      {socialPlatforms.map((platform) => (
        <Button
          key={platform.name}
          variant="ghost"
          size="sm"
          onClick={() => handleShare(platform)}
          className="h-8 px-3"
        >
          <platform.icon className="h-4 w-4 mr-1.5" />
          <span className="text-xs">{platform.name}</span>
        </Button>
      ))}

      {/* Copy Link Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="h-8 px-3"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1.5" />
            <span className="text-xs">
              {language === 'ar' ? 'تم النسخ' : 'Copied'}
            </span>
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4 mr-1.5" />
            <span className="text-xs">
              {language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
            </span>
          </>
        )}
      </Button>
    </div>
  );
}

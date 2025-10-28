import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: 'ar_EG' | 'en_US';
}

/**
 * SEO Head Component
 * مكون Meta Tags الديناميكية لتحسين SEO
 */
export function SEOHead({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  locale = 'ar_EG',
}: SEOHeadProps) {
  const siteName = "U.N.N.T - أخبار الأمم المتحدة اليوم";
  const siteUrl = "https://yoursite.com";
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // تنظيف العنوان والوصف
  const cleanTitle = title.replace(/<[^>]*>/g, '').substring(0, 60);
  const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 160);
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={locale === 'ar_EG' ? 'ar' : 'en'} dir={locale === 'ar_EG' ? 'rtl' : 'ltr'} />
      <title>{cleanTitle} | {siteName}</title>
      <meta name="description" content={cleanDescription} />
      
      {/* Keywords */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Author */}
      {author && <meta name="author" content={author} />}
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={cleanTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={cleanTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={cleanTitle} />
      <meta name="twitter:site" content="@UNNT_News" />
      <meta name="twitter:creator" content="@UNNT_News" />
      
      {/* Article Specific Meta Tags */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && (
            <meta property="article:author" content={author} />
          )}
          {section && (
            <meta property="article:section" content={section} />
          )}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="ar" href={fullUrl} />
      <link rel="alternate" hrefLang="en" href={fullUrl.replace('/ar/', '/en/')} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://api.aladhan.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      
      {/* Preconnect */}
      <link rel="preconnect" href="https://api.aladhan.com" crossOrigin="anonymous" />
    </Helmet>
  );
}

/**
 * Article Structured Data
 * بيانات منظمة للمقالات (Schema.org)
 */
export function ArticleStructuredData({ article }: any) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.titleEn || article.titleAr,
    "alternativeHeadline": article.titleAr || article.titleEn,
    "image": {
      "@type": "ImageObject",
      "url": article.coverImage,
      "width": 1200,
      "height": 630
    },
    "datePublished": article.publishedAt || article.createdAt,
    "dateModified": article.updatedAt || article.createdAt,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "U.N.N.T",
      "url": article.author?.profileImage
    },
    "publisher": {
      "@type": "Organization",
      "name": "U.N.N.T",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yoursite.com/logo.png",
        "width": 600,
        "height": 60
      }
    },
    "description": article.excerptEn || article.excerptAr,
    "articleBody": article.contentEn || article.contentAr,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://yoursite.com/article/${article.slug}`
    },
    "inLanguage": "ar-EG",
    "keywords": article.tags?.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Breadcrumb Structured Data
 * بيانات منظمة للتنقل
 */
export function BreadcrumbStructuredData({ items }: { items: Array<{label: string, href: string}> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://yoursite.com${item.href}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Organization Structured Data
 * بيانات منظمة للمنظمة
 */
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "U.N.N.T",
    "alternateName": "أخبار الأمم المتحدة اليوم",
    "url": "https://yoursite.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yoursite.com/logo.png",
      "width": 600,
      "height": 60
    },
    "sameAs": [
      "https://facebook.com/unnt",
      "https://twitter.com/unnt_news",
      "https://instagram.com/unnt",
      "https://youtube.com/unnt"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "info@yoursite.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

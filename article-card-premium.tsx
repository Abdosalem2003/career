import { useState } from 'react';
import { Heart, Share2, Eye, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

interface ArticleCardPremiumProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  categoryColor?: string;
  author: string;
  publishedAt: Date;
  views: number;
  readingTime: number;
  featured?: boolean;
  slug: string;
  tags?: string[];
}

export function ArticleCardPremium({
  id,
  title,
  excerpt,
  coverImage,
  category,
  categoryColor = 'from-blue-600 to-purple-600',
  author,
  publishedAt,
  views,
  readingTime,
  featured = false,
  slug,
  tags = []
}: ArticleCardPremiumProps) {
  const { language, dir } = useI18n();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 h-full flex flex-col">
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className={`bg-gradient-to-r ${categoryColor} text-white px-3 py-1 animate-pulse`}>
            ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        {/* Image */}
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className={`absolute bottom-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} z-10`}>
          <Badge className={`bg-gradient-to-r ${categoryColor} text-white`}>
            {category}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
            title={language === 'ar' ? 'أعجبني' : 'Like'}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isSaved
                ? 'bg-blue-500 text-white'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
            title={language === 'ar' ? 'حفظ' : 'Save'}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            className="p-2 rounded-full backdrop-blur-sm bg-white/30 text-white hover:bg-white/50 transition-all duration-300"
            title={language === 'ar' ? 'مشاركة' : 'Share'}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col p-4 md:p-5">
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
          {excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            <span>{views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{readingTime} {language === 'ar' ? 'دقيقة' : 'min'}</span>
          </div>
          <span>{formatDate(publishedAt)}</span>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {author.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{author}</span>
          </div>
          {likes > 0 && (
            <span className="text-xs font-semibold text-red-500">❤️ {likes}</span>
          )}
        </div>

        {/* CTA Button */}
        <Button
          className={`w-full bg-gradient-to-r ${categoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-semibold`}
          onClick={() => window.location.href = `/article/${slug}`}
        >
          {language === 'ar' ? 'اقرأ المقال' : 'Read Article'}
        </Button>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 transition-colors duration-300 pointer-events-none" />
    </article>
  );
}

// ============ Article Grid Component ============
interface ArticleGridProps {
  articles: ArticleCardPremiumProps[];
  columns?: number;
}

export function ArticleGrid({ articles, columns = 3 }: ArticleGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {articles.map((article) => (
        <ArticleCardPremium key={article.id} {...article} />
      ))}
    </div>
  );
}

// ============ Masonry Layout Component ============
export function ArticleMasonryGrid({ articles }: { articles: ArticleCardPremiumProps[] }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {articles.map((article) => (
        <div key={article.id} className="break-inside-avoid">
          <ArticleCardPremium {...article} />
        </div>
      ))}
    </div>
  );
}

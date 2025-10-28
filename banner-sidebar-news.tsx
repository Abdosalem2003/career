import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { Article } from '@shared/types';

interface BannerSidebarNewsProps {
  maxItems?: number;
  categoryFilter?: string;
}

export function BannerSidebarNews({
  maxItems = 10,
  categoryFilter,
}: BannerSidebarNewsProps) {
  const { language, dir } = useI18n();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Fetch articles
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles?limit=${maxItems}${categoryFilter ? `&category=${categoryFilter}` : ''}`],
  });

  useEffect(() => {
    if (articles.length > 0 && !selectedArticle) {
      setSelectedArticle(articles[0].id);
    }
  }, [articles, selectedArticle]);

  const activeArticle = articles.find(a => a.id === selectedArticle) || articles[0];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-600 to-purple-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'أخبار مختارة' : 'Featured News'}
        </h3>
      </div>

      {/* News List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
        {articles.slice(0, maxItems).map((article, index) => (
          <Link key={article.id} href={`/article/${article.slug}`}>
            <Card
              className={`overflow-hidden cursor-pointer transition-all duration-300 border-l-4 ${
                selectedArticle === article.id
                  ? 'border-l-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                  : 'border-l-gray-300 dark:border-l-gray-600 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setSelectedArticle(article.id)}
            >
              <CardContent className="p-3">
                {/* Number Badge */}
                <div className="flex items-start gap-3 mb-2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
                    {index + 1}
                  </Badge>
                  {article.featured && (
                    <Badge className="bg-yellow-500 text-white flex-shrink-0">
                      ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h4 className={`font-bold line-clamp-2 mb-2 transition-colors ${
                  selectedArticle === article.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white group-hover:text-blue-600'
                }`}>
                  {language === 'ar' ? article.titleAr : article.titleEn}
                </h4>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(article.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readingTime || 5} {language === 'ar' ? 'دقيقة' : 'min'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      {articles.length > 0 && (
        <Link href="/articles">
          <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
            {language === 'ar' ? 'عرض جميع الأخبار' : 'View All News'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      )}
    </div>
  );
}

// ============ Compact Version for Sidebar ============
export function CompactBannerSidebarNews({ maxItems = 5 }: { maxItems?: number }) {
  const { language } = useI18n();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles?limit=${maxItems}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {articles.slice(0, maxItems).map((article, index) => (
        <Link key={article.id} href={`/article/${article.slug}`}>
          <div className="p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer group border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-600 text-white text-xs flex-shrink-0 mt-0.5">
                {index + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {language === 'ar' ? article.titleAr : article.titleEn}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {(article.views || 0).toLocaleString()} {language === 'ar' ? 'مشاهدة' : 'views'}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

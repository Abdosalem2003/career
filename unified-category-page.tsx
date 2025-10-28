import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CategoryBannerCarousel } from './category-banner-carousel';
import { ArticleCardPremium, ArticleGrid } from './article-card-premium';
import { AdLayout, AdSpace } from './ad-spaces';
import { SpecialReports } from './special-reports';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, TrendingUp } from 'lucide-react';
import type { Article, Category } from '@shared/types';

interface UnifiedCategoryPageProps {
  categorySlug: string;
  categoryName: string;
  categoryColor?: string;
}

export function UnifiedCategoryPage({
  categorySlug,
  categoryName,
  categoryColor = 'from-blue-600 to-purple-600'
}: UnifiedCategoryPageProps) {
  const { language, dir } = useI18n();
  const [sortBy, setSortBy] = useState('latest');
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch category data
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`]
  });

  // Fetch articles for this category
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: [`/api/articles?category=${categorySlug}&sort=${sortBy}`]
  });

  // Get featured articles for carousel
  const featuredArticles = articles
    .filter(a => a.featured)
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      titleAr: a.titleAr || '',
      titleEn: a.titleEn || '',
      excerptAr: a.excerptAr || '',
      excerptEn: a.excerptEn || '',
      coverImage: a.coverImage || '',
      views: a.views || 0,
      category: categoryName,
      slug: a.slug
    }));

  // Get regular articles
  const regularArticles = articles
    .filter(a => !a.featured)
    .map(a => ({
      id: a.id,
      title: language === 'ar' ? a.titleAr : a.titleEn,
      excerpt: language === 'ar' ? a.excerptAr : a.excerptEn,
      coverImage: a.coverImage || '',
      category: categoryName,
      categoryColor,
      author: a.author?.name || 'Unknown',
      publishedAt: new Date(a.publishedAt || new Date()),
      views: a.views || 0,
      readingTime: a.readingTime || 5,
      featured: false,
      slug: a.slug,
      tags: a.tags || []
    }));

  const categoryColors: Record<string, string> = {
    'politics': 'from-red-600 to-pink-600',
    'economy': 'from-green-600 to-emerald-600',
    'technology': 'from-blue-600 to-cyan-600',
    'sports': 'from-orange-600 to-yellow-600',
    'health': 'from-purple-600 to-pink-600',
    'culture': 'from-indigo-600 to-purple-600',
    'science': 'from-teal-600 to-blue-600',
    'entertainment': 'from-pink-600 to-rose-600'
  };

  const finalCategoryColor = categoryColors[categorySlug] || categoryColor;

  return (
    <AdLayout showAds={true}>
      <div className="space-y-8 md:space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${finalCategoryColor}`} />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {categoryName}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === 'ar'
              ? `استكشف أحدث الأخبار والمقالات في قسم ${categoryName}`
              : `Explore the latest news and articles in ${categoryName}`}
          </p>
        </div>

        {/* Banner Carousel */}
        {featuredArticles.length > 0 && (
          <CategoryBannerCarousel
            articles={featuredArticles}
            categoryName={categoryName}
            categoryColor={finalCategoryColor}
          />
        )}

        {/* Special Reports Section */}
        <div className="my-8">
          <SpecialReports categoryId={category?.id} />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الترتيب:' : 'Sort by:'}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'latest', label: language === 'ar' ? 'الأحدث' : 'Latest' },
              { value: 'trending', label: language === 'ar' ? 'الأكثر قراءة' : 'Trending' },
              { value: 'popular', label: language === 'ar' ? 'الأكثر شهرة' : 'Popular' }
            ].map(option => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? `bg-gradient-to-r ${finalCategoryColor}` : ''}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {regularArticles.length > 0 ? (
          <ArticleGrid articles={regularArticles} columns={3} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد مقالات في هذا القسم حالياً' : 'No articles in this category yet'}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {regularArticles.length > 9 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className={`bg-gradient-to-r ${finalCategoryColor} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تحميل المزيد' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </AdLayout>
  );
}

// ============ Reusable Category Page Hook ============
export function useCategoryPage(categorySlug: string) {
  const { language } = useI18n();

  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`]
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: [`/api/articles?category=${categorySlug}`]
  });

  return {
    category,
    articles,
    categoryName: language === 'ar' ? category?.nameAr : category?.nameEn,
    featuredCount: articles.filter(a => a.featured).length,
    totalCount: articles.length
  };
}

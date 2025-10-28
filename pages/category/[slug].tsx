import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { UnifiedCategoryPage } from '@/components/unified-category-page';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import type { Category } from '@shared/types';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const { language } = useI18n();
  const slug = params?.slug;

  // Fetch category
  const { data: category, isLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-8 p-4 md:p-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? 'القسم غير موجود' : 'Category not found'}
          </h1>
          <p className="text-gray-500">
            {language === 'ar' ? 'عذراً، القسم الذي تبحث عنه غير موجود' : 'Sorry, the category you are looking for does not exist'}
          </p>
        </div>
      </div>
    );
  }

  const categoryName = language === 'ar' ? category.nameAr : category.nameEn;

  // Category color mapping
  const categoryColors: Record<string, string> = {
    'politics': 'from-red-600 to-pink-600',
    'economy': 'from-green-600 to-emerald-600',
    'technology': 'from-blue-600 to-cyan-600',
    'sports': 'from-orange-600 to-yellow-600',
    'health': 'from-purple-600 to-pink-600',
    'culture': 'from-indigo-600 to-purple-600',
    'science': 'from-teal-600 to-blue-600',
    'entertainment': 'from-pink-600 to-rose-600',
    'business': 'from-blue-700 to-blue-500',
    'world': 'from-gray-600 to-gray-800'
  };

  const categoryColor = categoryColors[slug || ''] || 'from-blue-600 to-purple-600';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <UnifiedCategoryPage
          categorySlug={slug || ''}
          categoryName={categoryName}
          categoryColor={categoryColor}
        />
      </div>
    </div>
  );
}

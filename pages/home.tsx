import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { AdPlacement } from "@/components/ad-placement";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { SpecialReports } from "@/components/special-reports";
import { EnhancedLatestArticles } from "@/components/enhanced-latest-articles";
import { ProfessionalHeroSection } from "@/components/professional-hero-section";
import { AllCategoriesSections } from "@/components/all-categories-sections";
import { PollsSection } from "@/components/polls-section";
import type { ArticleWithRelations } from "@shared/types";
import type { Category } from "@shared/types";

export default function Home() {
  const { t, language } = useI18n();

  const { data: featured, isLoading: loadingFeatured } = useQuery<any[]>({
    queryKey: ["/api/articles/featured"],
  });

  const { data: trending, isLoading: loadingTrending } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/trending"],
  });

  const { data: latest, isLoading: loadingLatest } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/latest"],
  });

  const { data: mostRead, isLoading: loadingMostRead } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/most-read"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        {/* Hero Section with Most Read Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-12">
          {/* Professional Hero Section */}
          <div>
            {!loadingFeatured && featured && featured.length > 0 && (
              <ProfessionalHeroSection articles={featured} />
            )}
          </div>

          {/* Most Read Widget - Moved to Hero Section */}
          <aside className="space-y-6">
            {/* Most Read - تصميم احترافي محسّن */}
            <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-fit sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-primary/20">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="text-section-most-read">
                  {t("home.mostRead")}
                </h3>
              </div>
              {loadingMostRead ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : mostRead && mostRead.length > 0 ? (
                <div className="space-y-3">
                  {mostRead.slice(0, 5).map((article, index) => (
                    <Link key={article.id} href={`/article/${article.slug}`} data-testid={`link-most-read-${index}`}>
                      <div className="group relative flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Gradient Background on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* رقم المقال */}
                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                          'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* محتوى المقال */}
                        <div className="flex-1 min-w-0 relative">
                          <h4 className="font-bold line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
                            {language === "ar" ? article.titleAr : article.titleEn}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="font-semibold">{article.views || 0}</span>
                              <span>{language === "ar" ? "مشاهدة" : "views"}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Arrow Icon */}
                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {language === "ar" ? "لا توجد مقالات" : "No articles available"}
                </p>
              )}
            </section>
          </aside>
        </div>

        {/* Enhanced Latest Articles */}
        <EnhancedLatestArticles 
          articles={latest || []} 
          loading={loadingLatest} 
        />

        {/* Ad Placement */}
        <AdPlacement placement="in-article" />

        {/* Special Reports Section */}
        <div className="my-12">
          <SpecialReports />
        </div>

        {/* All Categories Sections */}
        <AllCategoriesSections />

        {/* Main Content Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-12">
          {/* Main Content */}
          <div className="space-y-12">
            {/* This space can be used for more content sections */}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Prayer Times Widget - مرة واحدة فقط في الـ Sidebar */}
            <PrayerTimesWidget />

            {/* Sidebar Middle Ad */}
            <AdPlacement placement="sidebar-middle" />
          </aside>
        </div>

        {/* Footer Ad - مرة واحدة فقط */}
        <AdPlacement placement="footer" className="mt-12" />
      </div>
    </div>
  );
}

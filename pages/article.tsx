import { useParams, Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Clock, Eye, Calendar, User, Briefcase, TrendingUp, Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdPlacement } from "@/components/ad-placement";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCarousel } from "@/components/article/media-carousel";
import { SocialFollow } from "@/components/article/social-follow";
import { ShareSection } from "@/components/article/share-section";
import { RelatedCarouselPro } from "@/components/article/related-carousel-pro";
import { SpecialReports } from "@/components/special-reports";
import { PollWidget } from "@/components/poll-widget";
import type { ArticleWithRelations } from "@shared/schema";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useI18n();

  const { data: article, isLoading } = useQuery<ArticleWithRelations>({
    queryKey: ["/api/articles", slug],
  });

  const { data: relatedArticles } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/related", slug],
  });

  const { data: authorArticles } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/author", article?.authorId],
    enabled: !!article?.authorId,
  });

  const incrementViewsMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${slug}/increment-views`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", slug] });
    },
  });

  useEffect(() => {
    if (article) {
      incrementViewsMutation.mutate();
    }
  }, [article?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-[400px] w-full mb-8" />
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">
            {language === "ar" ? "المقال غير موجود" : "Article not found"}
          </h1>
          <Link href="/" data-testid="button-back-home">
            <Button>{t("header.home")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = language === "ar" ? article.titleAr : article.titleEn;
  const content = language === "ar" ? article.contentAr : article.contentEn;
  const excerpt = language === "ar" ? article.excerptAr : article.excerptEn;
  const categoryName = article.category ? (language === "ar" ? article.category.nameAr : article.category.nameEn) : '';

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = title || "";

  // تحويل الصور إلى مصفوفة للـ carousel
  const mediaItems = [
    { type: 'image' as const, url: article.coverImage || '', alt: title || '' },
    ...(article.gallery || []).map((url: string) => ({ type: 'image' as const, url, alt: title || '' }))
  ].filter(item => item.url);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <article className="max-w-4xl mx-auto w-full space-y-8">
            {/* 1. العنوان */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Category Badge */}
              {article.category && (
                <Link href={`/category/${article.category.slug}`} data-testid={`link-category-${article.category.slug}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {categoryName}
                </Button>
              </Link>
              )}

              {/* Title - عنوان احترافي */}
              <div className="relative">
                {/* Background Decoration */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
                
                {/* Title Container */}
                <div className="relative">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4" data-testid="text-article-title">
                    <span className="inline-block bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500">
                      {title}
                    </span>
                  </h1>
                  
                  {/* Decorative Line */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60"></div>
                    <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full opacity-40"></div>
                  </div>
                </div>
              </div>

              {/* Featured Badge */}
              {article.featured && (
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full">
                    ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* 2. بانر كاروسيل احترافي */}
            {mediaItems.length > 0 && (
              <MediaCarousel items={mediaItems} />
            )}

            {/* Ad Space بعد الكاروسيل */}
            <AdPlacement placement="sidebar-top" className="lg:hidden" />

            {/* 3. تابعنا على صفحاتنا - أيقونات السوشيال ميديا */}
            <SocialFollow />

            {/* 4. بيانات الناشر */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 py-3 border-y border-border/50"
            >
              {/* Author Info */}
              {article.author ? (
                <Link href={`/author/${article.author.id}`} data-testid="link-author-profile">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <UserAvatar
                      src={article.author.profileImage}
                      name={article.author.name || article.author.email || 'User'}
                      size="sm"
                      className="ring-2 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-500 transition-all"
                    />
                    <div>
                      <p className="font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" data-testid="text-author-name">
                        {article.author.name || 'كاتب'}
                      </p>
                      {article.author.jobTitle && (
                        <p className="text-xs text-muted-foreground">{article.author.jobTitle}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name="Unknown"
                    size="sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'كاتب غير معروف' : 'Unknown Author'}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-border" />

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {article.publishedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span data-testid="text-published-date">
                      {new Date(article.publishedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {article.readingTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span data-testid="text-reading-time">
                      {article.readingTime} {t("article.readTime")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  <span data-testid="text-views">
                    {article.views?.toLocaleString()} {t("article.views")}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 5. الموضوع */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:bg-gradient-to-r prose-headings:from-gray-900 prose-headings:to-gray-700 dark:prose-headings:from-gray-100 dark:prose-headings:to-gray-300 prose-headings:bg-clip-text prose-headings:text-transparent
                prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-img:rounded-2xl prose-img:shadow-2xl
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-950/30 prose-blockquote:p-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: content || "" }}
                data-testid="content-article-body"
              />
            </motion.div>

            {/* In-Article Ad */}
            <AdPlacement placement="in-article" className="my-12" />

            {/* 6. خانة مشاركة المقال */}
            <ShareSection 
              url={shareUrl}
              title={shareText}
              description={excerpt || ''}
            />

            {/* Footer Ad */}
            <AdPlacement placement="footer" className="my-12" />


            {/* Poll Widget - داخل المقال فقط */}
            {article.poll && (
              <div className="my-12">
                <div className="max-w-4xl mx-auto">
                  <PollWidget
                    question={article.poll.question}
                    options={article.poll.options}
                    pollId={article.id}
                    votes={article.poll.votes || []}
                  />
                </div>
              </div>
            )}

            {/* Ad Placement */}
            <div className="my-8">
              <AdPlacement placement="in-article" />
            </div>

            {/* 7. كاروسيل الأخبار ذات الصلة */}
            {relatedArticles && relatedArticles.length > 0 && (
              <RelatedCarouselPro articles={relatedArticles} />
            )}

            {/* Special Reports Section */}
            <div className="my-12">
              <SpecialReports categoryId={article.categoryId} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 hidden lg:block">
            {/* Sticky Container */}
            <div className="sticky top-4 space-y-6">
              {/* Ad Space 1 */}
              <AdPlacement placement="sidebar-top" />

              {/* Author Bio Card */}
              {article.author && article.author.bio && (
                <Card className="border-2 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-purple-500" />
                      <h3 className="font-bold text-lg">
                        {language === 'ar' ? 'عن الكاتب' : 'About Author'}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                      <UserAvatar
                        src={article.author.profileImage}
                        name={article.author.name || 'User'}
                        size="lg"
                        className="ring-4 ring-purple-100 dark:ring-purple-900"
                      />
                      <div>
                        <p className="font-bold text-lg">{article.author.name || 'كاتب'}</p>
                        {article.author.jobTitle && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                            <Briefcase className="h-3 w-3" />
                            {article.author.jobTitle}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.author.bio}
                      </p>
                      <Link href={`/author/${article.author.id}`}>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          {language === 'ar' ? 'المزيد من المقالات' : 'More Articles'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ad Space 2 */}
              <AdPlacement placement="sidebar-middle" />

              {/* Author Articles */}
              {authorArticles && authorArticles.length > 1 && (
                <Card className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      {language === "ar" ? "مقالات أخرى للكاتب" : "More by Author"}
                    </h3>
                    <div className="space-y-3">
                      {authorArticles.slice(0, 5).map((authorArticle) => {
                        if (authorArticle.id === article.id) return null;
                        return (
                          <Link key={authorArticle.id} href={`/article/${authorArticle.slug}`} data-testid={`link-author-article-${authorArticle.id}`}>
                            <div className="group p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {language === "ar" ? authorArticle.titleAr : authorArticle.titleEn}
                              </h4>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{authorArticle.views}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

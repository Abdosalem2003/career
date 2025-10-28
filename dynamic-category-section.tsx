import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { ArticleWithRelations, Category } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicCategorySectionProps {
  category: Category;
  index: number;
}

export function DynamicCategorySection({ category, index }: DynamicCategorySectionProps) {
  const { language } = useI18n();

  // جلب آخر 10 مقالات من هذا القسم
  const { data: articles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: [`/api/articles/category/${category.slug}`],
  });

  // إذا لم يكن هناك مقالات، لا تعرض القسم
  if (!isLoading && (!articles || articles.length === 0)) {
    return null;
  }

  const categoryName = language === "ar" ? category.nameAr : category.nameEn;
  const displayArticles = articles?.slice(0, 10) || [];

  // ألوان متدرجة بثيم Samsung
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-indigo-500 to-blue-500",
    "from-rose-500 to-pink-500",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-12"
    >
      {/* Header احترافي بثيم Samsung */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 mb-6 shadow-lg`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {categoryName}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {language === "ar" ? "آخر الأخبار" : "Latest News"}
              </p>
            </div>
          </div>
          <Link href={`/category/${category.slug}`}>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
            >
              {language === "ar" ? "عرض الكل" : "View All"}
              {language === "ar" ? (
                <ChevronLeft className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid احترافي للمقالات */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayArticles.map((article, idx) => (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <Card className="group relative overflow-hidden h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                {/* صورة المقال */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={article.coverImage || "/placeholder.svg"}
                    alt={(language === "ar" ? article.titleAr : article.titleEn) || "Article"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* رقم المقال */}
                  {idx < 3 && (
                    <div className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {article.featured && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {language === "ar" ? "مميز" : "Featured"}
                    </div>
                  )}
                </div>

                {/* محتوى المقال */}
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {language === "ar" ? article.titleAr : article.titleEn}
                  </h3>
                  
                  {article.excerptAr || article.excerptEn ? (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {language === "ar" ? article.excerptAr : article.excerptEn}
                    </p>
                  ) : null}

                  {/* معلومات إضافية */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-muted-foreground">
                      {article.views || 0} {language === "ar" ? "مشاهدة" : "views"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.publishedAt || article.createdAt || new Date()).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
}

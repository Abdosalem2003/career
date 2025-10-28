import { Link } from "wouter";
import { Clock, Eye, User, Bookmark, Share2, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ArticleWithRelations } from "@shared/schema";

interface ArticleCardProps {
  article: ArticleWithRelations;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { language, t } = useI18n();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const title = language === "ar" ? article.titleAr : article.titleEn;
  const excerpt = language === "ar" ? article.excerptAr : article.excerptEn;
  const categoryName = language === "ar" ? article.category.nameAr : article.category.nameEn;

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title || '',
        url: window.location.origin + `/article/${article.slug}`
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 ${
          featured ? "lg:col-span-2" : ""
        }`}
        data-testid={`card-article-${article.id}`}
      >
        <Link href={`/article/${article.slug}`}>
          <div className="block cursor-pointer relative">
            {/* Image */}
            {article.coverImage && (
              <div className={`relative overflow-hidden ${featured ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                <motion.img
                  src={article.coverImage}
                  alt={title || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Trending Badge - ميزة 1 */}
                {article.views && article.views > 1000 && (
                  <motion.div 
                    className="absolute top-4 right-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {language === "ar" ? "رائج" : "Trending"}
                    </Badge>
                  </motion.div>
                )}
                
                {/* Category Badge */}
                <motion.div 
                  className="absolute top-4 left-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge 
                    data-testid={`badge-category-${article.category.slug}`} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    {categoryName}
                  </Badge>
                </motion.div>

                {/* Quick Actions - ميزة 2 */}
                <motion.div 
                  className="absolute bottom-4 right-4 flex gap-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}

            <CardContent className={`${featured ? "p-6" : "p-5"}`}>
              {/* Date Badge - ميزة 3 */}
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(article.publishedAt || new Date()).toLocaleDateString(
                      language === "ar" ? "ar-SA" : "en-US",
                      { month: 'short', day: 'numeric' }
                    )}
                  </span>
                </div>
                {article.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
                    {language === "ar" ? "مميز" : "Featured"}
                  </Badge>
                )}
              </motion.div>

              {/* Title */}
              <h3 
                className={`font-bold mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${
                  featured ? "text-2xl md:text-3xl" : "text-base md:text-lg"
                }`}
                data-testid={`text-title-${article.id}`}
              >
                {title}
              </h3>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed" data-testid={`text-excerpt-${article.id}`}>
                  {excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {/* Author */}
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Avatar className="h-7 w-7 ring-2 ring-gray-200 dark:ring-gray-700">
                      <AvatarImage src={article.author.profileImage || undefined} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {article.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300" data-testid={`text-author-${article.id}`}>
                      {article.author.name}
                    </span>
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {/* Reading Time */}
                  {article.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span data-testid={`text-reading-time-${article.id}`}>
                        {article.readingTime} {t("article.readTime")}
                      </span>
                    </div>
                  )}

                  {/* Views */}
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span data-testid={`text-views-${article.id}`}>
                      {article.views?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Read More Indicator */}
              <motion.div
                className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  <span>{language === "ar" ? "اقرأ المزيد" : "Read More"}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </motion.div>
            </CardContent>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

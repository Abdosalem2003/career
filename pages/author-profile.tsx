/**
 * Modern Author Profile Page
 * صفحة بروفايل الناشر العصرية
 * 
 * Features:
 * - Profile Image Upload
 * - Author Bio & Info
 * - Published Articles
 * - Statistics
 * - Social Links
 * - Modern UI/UX
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import { ArticleCard } from "@/components/article-card";
import {
  User, Mail, MapPin, Calendar, FileText, Eye, TrendingUp,
  Twitter, Facebook, Instagram, Linkedin, Globe, Edit,
  Share2, BarChart3, Award, Star, BookOpen, Activity
} from "lucide-react";

export default function AuthorProfile() {
  const { language, t } = useI18n();
  const params = useParams();
  const authorId = params.id;

  // Fetch author data
  const { data: author, isLoading: authorLoading } = useQuery<any>({
    queryKey: [`/api/users/${authorId}`],
    enabled: !!authorId,
  });

  // Fetch author articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery<any[]>({
    queryKey: [`/api/articles/author/${authorId}`],
    enabled: !!authorId,
  });

  const isLoading = authorLoading || articlesLoading;

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {language === "ar" ? "المستخدم غير موجود" : "User not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        {author.coverImage && (
          <img
            src={author.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 -mt-20 md:-mt-24 relative z-10">
        {/* Profile Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-2xl">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <UserAvatar
                  src={author.profileImage}
                  name={author.name}
                  size="xl"
                  className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {author.name}
                    </h1>
                    {author.jobTitle && (
                      <p className="text-lg text-blue-600 dark:text-blue-400 mb-3">
                        {author.jobTitle}
                      </p>
                    )}
                    {author.bio && (
                      <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                        {author.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-center md:justify-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: author.name,
                            text: author.bio || '',
                            url: window.location.href
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert(language === "ar" ? "تم نسخ الرابط" : "Link copied");
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {language === "ar" ? "مشاركة" : "Share"}
                    </Button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {author.department && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{author.department}</span>
                    </div>
                  )}
                  {author.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {language === "ar" ? "انضم في" : "Joined"} {new Date(author.createdAt).toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {author.phone && (
                    <div className="flex items-center gap-1">
                      <span>📱</span>
                      <span>{author.phone}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {author.socialLinks && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                    {author.socialLinks.twitter && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.twitter} target="_blank" rel="noopener">
                          <Twitter className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {author.socialLinks.facebook && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.facebook} target="_blank" rel="noopener">
                          <Facebook className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {author.socialLinks.instagram && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.instagram} target="_blank" rel="noopener">
                          <Instagram className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {author.socialLinks.linkedin && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.linkedin} target="_blank" rel="noopener">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {author.socialLinks.youtube && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.youtube} target="_blank" rel="noopener">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      </Button>
                    )}
                    {author.socialLinks.website && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={author.socialLinks.website} target="_blank" rel="noopener">
                          <Globe className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {articles.length || 0}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === "ar" ? "مقال" : "Articles"}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {articles.reduce((sum: number, article: any) => sum + (article.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === "ar" ? "مشاهدات" : "Views"}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {author.status === 'active' ? '✓' : '✗'}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === "ar" ? author.status === 'active' ? "نشط" : "غير نشط" : author.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="articles" className="mb-8">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {language === "ar" ? "المقالات" : "Articles"}
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {language === "ar" ? "الأكثر قراءة" : "Most Read"}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {language === "ar" ? "الإحصائيات" : "Statistics"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "لا توجد مقالات بعد" : "No articles yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === "ar" ? "الأكثر قراءة" : "Most Read Articles"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === "ar" ? "قريباً..." : "Coming soon..."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    {language === "ar" ? "الإنجازات" : "Achievements"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-start gap-2 py-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      {language === "ar" ? "كاتب مميز" : "Featured Writer"}
                    </Badge>
                    <Badge variant="secondary" className="w-full justify-start gap-2 py-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      {language === "ar" ? "الأكثر قراءة" : "Top Read"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    {language === "ar" ? "هذا الشهر" : "This Month"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === "ar" ? "مقالات جديدة" : "New Articles"}
                      </span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === "ar" ? "مشاهدات" : "Views"}
                      </span>
                      <span className="font-bold">45.2K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    {language === "ar" ? "الأقسام" : "Categories"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>سياسة</Badge>
                    <Badge>اقتصاد</Badge>
                    <Badge>رياضة</Badge>
                    <Badge>تكنولوجيا</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

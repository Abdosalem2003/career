import { useParams } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ArticleCard } from "@/components/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Briefcase, Building } from "lucide-react";
import type { User, ArticleWithRelations } from "@shared/schema";

export default function AuthorPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();

  const { data: author, isLoading: loadingAuthor } = useQuery<User>({
    queryKey: ["/api/users", id],
  });

  const { data: articles, isLoading: loadingArticles } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/author", id],
  });

  if (loadingAuthor) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <p className="text-center text-muted-foreground">
          {language === "ar" ? "المستخدم غير موجود" : "Author not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Author Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 p-6 bg-card rounded-lg border">
          <UserAvatar 
            src={author.profileImage}
            name={author.name}
            size="xl"
            data-testid="avatar-author"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-author-name">
              {author.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {author.jobTitle && (
                <div className="flex items-center gap-2" data-testid="text-job-title">
                  <Briefcase className="h-4 w-4" />
                  <span>{author.jobTitle}</span>
                </div>
              )}
              {author.department && (
                <div className="flex items-center gap-2" data-testid="text-department">
                  <Building className="h-4 w-4" />
                  <span>{author.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2" data-testid="text-email">
                <Mail className="h-4 w-4" />
                <span>{author.email}</span>
              </div>
            </div>

            {author.bio && (
              <p className="text-muted-foreground leading-relaxed" data-testid="text-bio">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Author's Articles */}
        <div>
          <h2 className="text-2xl font-bold mb-6" data-testid="text-articles-title">
            {language === "ar" ? "مقالات الكاتب" : "Author's Articles"}
          </h2>

          {loadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              {language === "ar" ? "لا توجد مقالات لهذا الكاتب" : "No articles by this author"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

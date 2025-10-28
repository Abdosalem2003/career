import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export function NewsTicker() {
  const { language, dir } = useI18n();
  
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles/breaking"],
  });

  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden" data-testid="news-ticker">
      <div className="container mx-auto max-w-7xl px-4 flex items-center gap-4">
        <span className="font-bold text-sm whitespace-nowrap bg-white text-red-600 px-3 py-1 rounded">
          {language === "ar" ? "🔴 عاجل" : "🔴 BREAKING"}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className={`flex gap-8 animate-marquee ${dir === "rtl" ? "animate-marquee-rtl" : ""}`}>
            {[...articles, ...articles].map((article, i) => (
              <Link key={i} href={`/article/${article.slug}`}>
                <span className="text-sm whitespace-nowrap hover:underline cursor-pointer transition-all">
                  {language === "ar" ? article.titleAr : article.titleEn}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

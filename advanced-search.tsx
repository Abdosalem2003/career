import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  FileText,
  ArrowRight,
  Sparkles,
  Mic,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr?: string;
  excerptEn?: string;
  slug: string;
  coverImage?: string;
  category?: {
    nameAr: string;
    nameEn: string;
  };
  views?: number;
  publishedAt?: string;
}

interface AdvancedSearchProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export function AdvancedSearch({ className, onClose, autoFocus = false }: AdvancedSearchProps) {
  const { language } = useI18n();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // البحث في المقالات
  const { data: searchResults = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  // الأخبار الشائعة (عند عدم وجود بحث)
  const { data: trendingArticles = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/articles", { sort: "views", limit: 5 }],
    enabled: searchQuery.length === 0,
  });

  // الأخبار الأخيرة
  const { data: recentArticles = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/articles", { sort: "recent", limit: 5 }],
    enabled: searchQuery.length === 0,
  });

  // عمليات البحث الشائعة
  const popularSearches = [
    language === "ar" ? "الأمم المتحدة" : "United Nations",
    language === "ar" ? "السلام العالمي" : "World Peace",
    language === "ar" ? "التنمية المستدامة" : "Sustainable Development",
    language === "ar" ? "حقوق الإنسان" : "Human Rights",
    language === "ar" ? "المناخ" : "Climate",
  ];

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // فقط عرض النتائج عند الكتابة (2 حرف أو أكثر)
    setIsOpen(searchQuery.length >= 2);
  }, [searchQuery]);

  // التنقل بالكيبورد
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const results = searchQuery.length >= 2 ? searchResults : trendingArticles;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, trendingArticles, searchQuery]);

  const handleResultClick = (article: SearchResult) => {
    setLocation(`/article/${article.slug}`);
    setSearchQuery("");
    setIsOpen(false);
    onClose?.();
  };

  const handlePopularSearchClick = (query: string) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">{part}</mark>
        : part
    );
  };

  const filteredResults = searchQuery.length >= 2 ? searchResults : [];
  const suggestedArticles = searchQuery.length === 0 ? trendingArticles : [];

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={language === "ar" ? "ابحث في الأخبار..." : "Search news..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-12 text-base rounded-xl border-2 focus:border-blue-500 transition-all"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card 
          ref={resultsRef}
          className="absolute top-full mt-2 w-full max-h-[600px] overflow-y-auto shadow-2xl border-2 z-50 animate-in fade-in slide-in-from-top-2"
        >
          <div className="p-4 space-y-4">
            {/* Loading State */}
            {isLoading && searchQuery.length >= 2 && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}

            {/* Search Results */}
            {!isLoading && filteredResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 pb-2 border-b">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{language === "ar" ? "نتائج البحث" : "Search Results"}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredResults.length} {language === "ar" ? "نتيجة" : "results"}
                  </Badge>
                </div>
                {filteredResults.map((article, index) => (
                  <button
                    key={article.id}
                    onClick={() => handleResultClick(article)}
                    className={cn(
                      "w-full text-right p-3 rounded-lg hover:bg-muted transition-colors group",
                      selectedIndex === index && "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {highlightText(
                            language === "ar" ? article.titleAr : article.titleEn,
                            searchQuery
                          )}
                        </h4>
                        {(article.excerptAr || article.excerptEn) && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {highlightText(
                              (language === "ar" ? article.excerptAr : article.excerptEn) || "",
                              searchQuery
                            )}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {article.category && (
                            <Badge variant="secondary" className="text-xs">
                              {language === "ar" ? article.category.nameAr : article.category.nameEn}
                            </Badge>
                          )}
                          {article.views && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {article.views}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchQuery.length >= 2 && filteredResults.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد نتائج" : "No results found"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "ar" ? "جرب كلمات مختلفة" : "Try different keywords"}
                </p>
              </div>
            )}

            {/* Suggested Content (when no search) */}
            {searchQuery.length === 0 && (
              <>
                {/* Popular Searches */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground px-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{language === "ar" ? "عمليات بحث شائعة" : "Popular Searches"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePopularSearchClick(search)}
                        className="rounded-full"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Trending Articles */}
                {suggestedArticles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground px-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{language === "ar" ? "الأكثر قراءة" : "Trending Now"}</span>
                    </div>
                    {suggestedArticles.map((article, index) => (
                      <button
                        key={article.id}
                        onClick={() => handleResultClick(article)}
                        className="w-full text-right p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          {article.coverImage && (
                            <img
                              src={article.coverImage}
                              alt=""
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {language === "ar" ? article.titleAr : article.titleEn}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              {article.views && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {article.views.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Articles */}
                {recentArticles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground px-2">
                      <Clock className="h-4 w-4" />
                      <span>{language === "ar" ? "أحدث الأخبار" : "Latest News"}</span>
                    </div>
                    {recentArticles.slice(0, 3).map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleResultClick(article)}
                        className="w-full text-right p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {language === "ar" ? article.titleAr : article.titleEn}
                            </h4>
                            {article.publishedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(article.publishedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

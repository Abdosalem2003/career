import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Search, X, TrendingUp, Clock } from "lucide-react";
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

interface ModernSearchProps {
  className?: string;
}

export function ModernSearch({ className }: ModernSearchProps) {
  const { language } = useI18n();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // البحث عند تغيير النص
  useEffect(() => {
    const searchArticles = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchArticles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // التنقل بالكيبورد
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || searchResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === "Enter" && searchResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(searchResults[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchResults]);

  const handleResultClick = (article: SearchResult) => {
    setLocation(`/article/${article.slug}`);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input - تصميم بسيط وأنيق */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={language === "ar" ? "ابحث في الأخبار..." : "Search news..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
          className={cn(
            "w-full h-11 pl-10 pr-10 rounded-full",
            "bg-gray-50 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "text-sm placeholder:text-gray-400",
            "transition-all duration-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown - تصميم عصري وبسيط */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full mt-2 w-full",
            "bg-white dark:bg-gray-900",
            "rounded-2xl shadow-2xl",
            "border border-gray-200 dark:border-gray-800",
            "max-h-[500px] overflow-y-auto",
            "animate-in fade-in slide-in-from-top-2 duration-200",
            "z-50"
          )}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                <p className="text-sm text-gray-500">
                  {language === "ar" ? "جاري البحث..." : "Searching..."}
                </p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchResults.length > 0 && (
            <div className="p-3">
              {/* Results Header */}
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {language === "ar" ? "النتائج" : "Results"}
                </span>
                <span className="text-xs text-gray-400">
                  {searchResults.length} {language === "ar" ? "نتيجة" : "found"}
                </span>
              </div>

              {/* Results List */}
              <div className="space-y-1">
                {searchResults.map((article, index) => (
                  <button
                    key={article.id}
                    onClick={() => handleResultClick(article)}
                    className={cn(
                      "w-full text-right p-3 rounded-xl transition-all duration-150",
                      "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      "group cursor-pointer",
                      selectedIndex === index && "bg-gray-50 dark:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Article Image */}
                      {article.coverImage && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={article.coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}

                      {/* Article Info */}
                      <div className="flex-1 min-w-0 text-right">
                        {/* Title */}
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {highlightText(
                            language === "ar" ? article.titleAr : article.titleEn,
                            searchQuery
                          )}
                        </h4>

                        {/* Excerpt */}
                        {(article.excerptAr || article.excerptEn) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                            {highlightText(
                              (language === "ar" ? article.excerptAr : article.excerptEn) || "",
                              searchQuery
                            )}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {article.category && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {language === "ar" ? article.category.nameAr : article.category.nameEn}
                            </span>
                          )}
                          {article.views && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {article.views.toLocaleString()}
                            </span>
                          )}
                          {article.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(article.publishedAt).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {language === "ar" ? "لا توجد نتائج" : "No results found"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {language === "ar" 
                  ? "جرب كلمات بحث مختلفة" 
                  : "Try different search terms"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

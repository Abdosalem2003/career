import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Article } from "@shared/types";
import { FolderOpen, Search, Eye, Calendar, User, X } from "lucide-react";
import { useState } from "react";

interface ViewArticlesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
}

export function ViewArticlesDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  categoryNameAr,
}: ViewArticlesDialogProps) {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const categoryArticles = (articles as Article[] || []).filter(
    (a) => a.categoryId === categoryId
  );

  const filteredArticles = categoryArticles.filter((article) =>
    article.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.titleAr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -mx-6 -mt-6 px-6 py-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold">
                {language === "ar" ? "المقالات" : "Articles"}
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1">
                {language === "ar"
                  ? `${categoryNameAr} (${categoryName})`
                  : `${categoryName} (${categoryNameAr})`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder={language === "ar" ? "ابحث عن مقالة..." : "Search articles..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Articles Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              {language === "ar"
                ? `${filteredArticles.length} من ${categoryArticles.length} مقالة`
                : `${filteredArticles.length} of ${categoryArticles.length} articles`}
            </span>
          </div>

          {/* Articles List */}
          <ScrollArea className="h-[400px] border border-gray-200 rounded-lg p-4">
            {filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  {language === "ar" ? "لا توجد مقالات" : "No articles found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">
                          {language === "ar" ? article.titleAr : article.titleEn}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {language === "ar"
                            ? article.excerptAr
                            : article.excerptEn
                          }
                        </p>

                        {/* Article Meta */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                          {article.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(article.createdAt).toLocaleDateString(
                                  language === "ar" ? "ar-SA" : "en-US"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        className={`whitespace-nowrap ${
                          article.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {article.status === "published"
                          ? language === "ar"
                            ? "منشور"
                            : "Published"
                          : language === "ar"
                          ? "مسودة"
                          : "Draft"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

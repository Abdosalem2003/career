import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Tag, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  excerptEn?: string;
  excerptAr?: string;
  contentEn: string;
  contentAr: string;
  status: string;
  views: number;
  featured: boolean;
  publishedAt: string;
  coverImage?: string;
  author: { name: string };
  category: { nameEn: string; nameAr: string };
  tags?: string[];
}

interface ViewArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
}

export function ViewArticleDialog({ open, onOpenChange, article }: ViewArticleDialogProps) {
  const { language } = useI18n();

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {article.featured && <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
            {language === "ar" ? article.titleAr : article.titleEn}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Cover Image */}
            {article.coverImage && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <img 
                  src={article.coverImage} 
                  alt={language === "ar" ? article.titleAr : article.titleEn}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">{language === "ar" ? "المشاهدات" : "Views"}</p>
                  <p className="font-bold text-blue-600">{article.views?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">{language === "ar" ? "الكاتب" : "Author"}</p>
                  <p className="font-bold text-purple-600">{article.author.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">{language === "ar" ? "التاريخ" : "Date"}</p>
                  <p className="font-bold text-green-600 text-xs">
                    {new Date(article.publishedAt).toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Tag className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-600">{language === "ar" ? "القسم" : "Category"}</p>
                  <p className="font-bold text-orange-600 text-xs">
                    {language === "ar" ? article.category.nameAr : article.category.nameEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Featured */}
            <div className="flex items-center gap-3">
              <Badge variant={article.status === "published" ? "default" : "secondary"}>
                {article.status === "published" 
                  ? (language === "ar" ? "منشور" : "Published")
                  : (language === "ar" ? "مسودة" : "Draft")}
              </Badge>
              {article.featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  {language === "ar" ? "مميز" : "Featured"}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Excerpt */}
            {(article.excerptAr || article.excerptEn) && (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-2">
                  {language === "ar" ? "المقتطف" : "Excerpt"}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {language === "ar" ? article.excerptAr : article.excerptEn}
                </p>
              </div>
            )}

            {/* Content */}
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-4">
                {language === "ar" ? "المحتوى" : "Content"}
              </h3>
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {language === "ar" ? article.contentAr : article.contentEn}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  {language === "ar" ? "الوسوم" : "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Article Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{language === "ar" ? "الرابط:" : "Slug:"}</span>
                  <span className="font-mono ml-2 text-blue-600">{article.slug}</span>
                </div>
                <div>
                  <span className="text-gray-600">{language === "ar" ? "المعرف:" : "ID:"}</span>
                  <span className="font-mono ml-2 text-gray-800">{article.id}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * SEO Panel Component
 * لوحة تحسين محركات البحث
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface SEOPanelProps {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  keywords: string[];
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onFocusKeywordChange: (value: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
  seoScore: number;
  language: string;
}

export function SEOPanel({
  seoTitle,
  seoDescription,
  focusKeyword,
  keywords,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onFocusKeywordChange,
  onKeywordsChange,
  seoScore,
  language
}: SEOPanelProps) {
  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;

  const getTitleStatus = () => {
    if (titleLength >= 50 && titleLength <= 60) return { color: "text-green-600", icon: CheckCircle2 };
    if (titleLength > 0) return { color: "text-yellow-600", icon: AlertCircle };
    return { color: "text-red-600", icon: AlertCircle };
  };

  const getDescStatus = () => {
    if (descLength >= 150 && descLength <= 160) return { color: "text-green-600", icon: CheckCircle2 };
    if (descLength > 0) return { color: "text-yellow-600", icon: AlertCircle };
    return { color: "text-red-600", icon: AlertCircle };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {language === "ar" ? "تحسين محركات البحث (SEO)" : "Search Engine Optimization (SEO)"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "حسّن ظهور مقالك في نتائج البحث" 
                : "Optimize your article for search engines"}
            </CardDescription>
          </div>
          <Badge 
            variant={seoScore >= 80 ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            {seoScore}%
          </Badge>
        </div>
        <Progress value={seoScore} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SEO Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              {language === "ar" ? "عنوان SEO" : "SEO Title"}
              <titleStatus.icon className={`h-4 w-4 ${titleStatus.color}`} />
            </Label>
            <span className={`text-sm ${titleStatus.color}`}>
              {titleLength}/60
            </span>
          </div>
          <Input
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder={language === "ar" ? "عنوان محسّن لمحركات البحث (50-60 حرف)" : "SEO optimized title (50-60 chars)"}
            maxLength={60}
          />
          <p className="text-xs text-gray-500">
            {language === "ar" 
              ? "الطول المثالي: 50-60 حرف" 
              : "Optimal length: 50-60 characters"}
          </p>
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              {language === "ar" ? "وصف SEO" : "SEO Description"}
              <descStatus.icon className={`h-4 w-4 ${descStatus.color}`} />
            </Label>
            <span className={`text-sm ${descStatus.color}`}>
              {descLength}/160
            </span>
          </div>
          <Textarea
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder={language === "ar" ? "وصف محسّن لمحركات البحث (150-160 حرف)" : "SEO optimized description (150-160 chars)"}
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-gray-500">
            {language === "ar" 
              ? "الطول المثالي: 150-160 حرف" 
              : "Optimal length: 150-160 characters"}
          </p>
        </div>

        {/* Focus Keyword */}
        <div className="space-y-2">
          <Label>
            {language === "ar" ? "الكلمة المفتاحية الرئيسية" : "Focus Keyword"}
          </Label>
          <Input
            value={focusKeyword}
            onChange={(e) => onFocusKeywordChange(e.target.value)}
            placeholder={language === "ar" ? "الكلمة المفتاحية الأساسية" : "Main focus keyword"}
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label>
            {language === "ar" ? "الكلمات المفتاحية" : "Keywords"}
          </Label>
          <Input
            placeholder={language === "ar" ? "أضف كلمة مفتاحية واضغط Enter" : "Add keyword and press Enter"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                onKeywordsChange([...keywords, e.currentTarget.value]);
                e.currentTarget.value = "";
              }
            }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {keyword}
                <button
                  onClick={() => onKeywordsChange(keywords.filter((_, i) => i !== index))}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* SEO Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {language === "ar" ? "نصائح SEO" : "SEO Tips"}
          </h4>
          <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <li>✓ {language === "ar" ? "استخدم الكلمة المفتاحية في العنوان" : "Use focus keyword in title"}</li>
            <li>✓ {language === "ar" ? "اكتب وصفاً جذاباً ومفيداً" : "Write compelling and useful description"}</li>
            <li>✓ {language === "ar" ? "أضف 3-5 كلمات مفتاحية ذات صلة" : "Add 3-5 relevant keywords"}</li>
            <li>✓ {language === "ar" ? "استخدم الصور مع نص بديل" : "Use images with alt text"}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

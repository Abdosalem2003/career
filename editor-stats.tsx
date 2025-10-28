/**
 * Editor Statistics Component
 * مكون إحصائيات المحرر
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Type, Clock, Target, Image, CheckCircle2 } from "lucide-react";

interface EditorStatsProps {
  wordCount: number;
  charCount: number;
  readingTime: number;
  seoScore: number;
  imageCount: number;
  language: string;
}

export function EditorStats({
  wordCount,
  charCount,
  readingTime,
  seoScore,
  imageCount,
  language
}: EditorStatsProps) {
  const getSEOColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Word Count */}
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">
              {language === "ar" ? "الكلمات" : "Words"}
            </p>
            <p className="text-lg font-bold">{wordCount}</p>
          </div>
        </div>

        {/* Characters */}
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">
              {language === "ar" ? "الأحرف" : "Characters"}
            </p>
            <p className="text-lg font-bold">{charCount}</p>
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-xs text-gray-500">
              {language === "ar" ? "وقت القراءة" : "Reading Time"}
            </p>
            <p className="text-lg font-bold">
              {readingTime} {language === "ar" ? "د" : "min"}
            </p>
          </div>
        </div>

        {/* SEO Score */}
        <div className="flex items-center gap-2">
          <Target className={`h-4 w-4 ${getSEOColor(seoScore)}`} />
          <div>
            <p className="text-xs text-gray-500">SEO</p>
            <p className={`text-lg font-bold ${getSEOColor(seoScore)}`}>
              {seoScore}%
            </p>
          </div>
        </div>

        {/* Images */}
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-pink-600" />
          <div>
            <p className="text-xs text-gray-500">
              {language === "ar" ? "الصور" : "Images"}
            </p>
            <p className="text-lg font-bold">{imageCount}</p>
          </div>
        </div>
      </div>

      {/* SEO Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {language === "ar" ? "تقييم SEO" : "SEO Score"}
          </span>
          <Badge variant={seoScore >= 80 ? "default" : "secondary"}>
            {seoScore >= 80 ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : null}
            {seoScore}%
          </Badge>
        </div>
        <Progress value={seoScore} className="h-2" />
      </div>
    </Card>
  );
}

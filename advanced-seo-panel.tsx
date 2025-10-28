import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Globe, Twitter, Facebook, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SEOData {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

interface AdvancedSEOPanelProps {
  data: SEOData;
  onChange: (data: SEOData) => void;
  articleTitle?: string;
  articleExcerpt?: string;
  language?: 'ar' | 'en';
}

export function AdvancedSEOPanel({ data, onChange, articleTitle, articleExcerpt, language = 'ar' }: AdvancedSEOPanelProps) {
  const [seoScore, setSeoScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Ensure data has default values
  const seoData = data || {
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    keywords: '',
    ogImage: '',
    canonicalUrl: ''
  };

  // Calculate SEO Score
  useEffect(() => {
    let score = 0;
    const newSuggestions: string[] = [];

    // Title checks
    if (seoData.titleEn || seoData.titleAr) {
      score += 20;
      const title = language === 'ar' ? seoData.titleAr : seoData.titleEn;
      if (title && title.length >= 50 && title.length <= 60) {
        score += 10;
      } else if (title) {
        newSuggestions.push(language === 'ar' 
          ? 'العنوان يجب أن يكون بين 50-60 حرف للحصول على أفضل نتائج'
          : 'Title should be 50-60 characters for best results');
      }
    } else {
      newSuggestions.push(language === 'ar' ? 'أضف عنوان SEO' : 'Add SEO title');
    }

    // Description checks
    if (seoData.descriptionEn || seoData.descriptionAr) {
      score += 20;
      const desc = language === 'ar' ? seoData.descriptionAr : seoData.descriptionEn;
      if (desc && desc.length >= 150 && desc.length <= 160) {
        score += 10;
      } else if (desc) {
        newSuggestions.push(language === 'ar'
          ? 'الوصف يجب أن يكون بين 150-160 حرف'
          : 'Description should be 150-160 characters');
      }
    } else {
      newSuggestions.push(language === 'ar' ? 'أضف وصف SEO' : 'Add SEO description');
    }

    // Keywords
    if (seoData.keywords && seoData.keywords.split(',').length >= 3) {
      score += 15;
    } else {
      newSuggestions.push(language === 'ar' ? 'أضف على الأقل 3 كلمات مفتاحية' : 'Add at least 3 keywords');
    }

    // OG Image
    if (seoData.ogImage) {
      score += 15;
    } else {
      newSuggestions.push(language === 'ar' ? 'أضف صورة Open Graph' : 'Add Open Graph image');
    }

    // Canonical URL
    if (seoData.canonicalUrl) {
      score += 10;
    }

    setSeoScore(score);
    setSuggestions(newSuggestions);
  }, [seoData, language]);

  const getScoreColor = () => {
    if (seoScore >= 80) return 'text-green-600';
    if (seoScore >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (seoScore >= 80) return language === 'ar' ? 'ممتاز' : 'Excellent';
    if (seoScore >= 50) return language === 'ar' ? 'جيد' : 'Good';
    return language === 'ar' ? 'يحتاج تحسين' : 'Needs Improvement';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {language === 'ar' ? 'تحسين محركات البحث (SEO)' : 'Search Engine Optimization'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'حسّن ظهور مقالك في محركات البحث'
                : 'Optimize your article for search engines'}
            </CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor()}`}>{seoScore}%</div>
            <div className="text-xs text-muted-foreground">{getScoreLabel()}</div>
          </div>
        </div>
        <Progress value={seoScore} className="mt-2" />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              {language === 'ar' ? 'أساسي' : 'Basic'}
            </TabsTrigger>
            <TabsTrigger value="social">
              {language === 'ar' ? 'سوشيال ميديا' : 'Social Media'}
            </TabsTrigger>
            <TabsTrigger value="preview">
              {language === 'ar' ? 'معاينة' : 'Preview'}
            </TabsTrigger>
          </TabsList>

          {/* Basic SEO */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'عنوان SEO (عربي)' : 'SEO Title (Arabic)'}</Label>
                <Input
                  value={seoData.titleAr || ''}
                  onChange={(e) => onChange({ ...seoData, titleAr: e.target.value })}
                  placeholder={articleTitle || (language === 'ar' ? 'عنوان المقال...' : 'Article title...')}
                  dir="rtl"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.titleAr?.length || 0} / 60</span>
                  <span>{language === 'ar' ? 'الأمثل: 50-60 حرف' : 'Optimal: 50-60 chars'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'عنوان SEO (إنجليزي)' : 'SEO Title (English)'}</Label>
                <Input
                  value={seoData.titleEn || ''}
                  onChange={(e) => onChange({ ...seoData, titleEn: e.target.value })}
                  placeholder="Article title..."
                  dir="ltr"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.titleEn?.length || 0} / 60</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'وصف SEO (عربي)' : 'SEO Description (Arabic)'}</Label>
                <Textarea
                  value={seoData.descriptionAr || ''}
                  onChange={(e) => onChange({ ...seoData, descriptionAr: e.target.value })}
                  placeholder={articleExcerpt || (language === 'ar' ? 'وصف مختصر للمقال...' : 'Brief description...')}
                  dir="rtl"
                  maxLength={160}
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.descriptionAr?.length || 0} / 160</span>
                  <span>{language === 'ar' ? 'الأمثل: 150-160 حرف' : 'Optimal: 150-160 chars'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'وصف SEO (إنجليزي)' : 'SEO Description (English)'}</Label>
                <Textarea
                  value={seoData.descriptionEn || ''}
                  onChange={(e) => onChange({ ...seoData, descriptionEn: e.target.value })}
                  placeholder="Brief description..."
                  dir="ltr"
                  maxLength={160}
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.descriptionEn?.length || 0} / 160</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الكلمات المفتاحية' : 'Keywords'}</Label>
                <Input
                  value={seoData.keywords || ''}
                  onChange={(e) => onChange({ ...seoData, keywords: e.target.value })}
                  placeholder={language === 'ar' ? 'كلمة1, كلمة2, كلمة3' : 'keyword1, keyword2, keyword3'}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'افصل الكلمات بفاصلة' : 'Separate keywords with commas'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الرابط الأساسي (Canonical URL)' : 'Canonical URL'}</Label>
                <Input
                  value={seoData.canonicalUrl || ''}
                  onChange={(e) => onChange({ ...seoData, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/article"
                  dir="ltr"
                  type="url"
                />
              </div>
            </div>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Facebook className="h-4 w-4" />
                {language === 'ar' ? 'Open Graph (فيسبوك، لينكد إن)' : 'Open Graph (Facebook, LinkedIn)'}
              </div>
              
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'صورة Open Graph' : 'Open Graph Image'}</Label>
                <Input
                  value={seoData.ogImage || ''}
                  onChange={(e) => onChange({ ...seoData, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'الحجم الموصى به: 1200x630 بكسل' : 'Recommended size: 1200x630px'}
                </p>
              </div>

              {seoData.ogImage && (
                <div className="border rounded-lg p-2">
                  <img src={seoData.ogImage} alt="OG Preview" className="w-full h-auto rounded" />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-4">
            {/* Google Preview */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Globe className="h-4 w-4" />
                {language === 'ar' ? 'معاينة جوجل' : 'Google Preview'}
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-green-700 mb-1">
                  {seoData.canonicalUrl || 'https://example.com/article'}
                </div>
                <div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                  {(language === 'ar' ? seoData.titleAr : seoData.titleEn) || articleTitle || (language === 'ar' ? 'عنوان المقال' : 'Article Title')}
                </div>
                <div className="text-sm text-gray-600">
                  {(language === 'ar' ? seoData.descriptionAr : seoData.descriptionEn) || articleExcerpt || (language === 'ar' ? 'وصف المقال يظهر هنا...' : 'Article description appears here...')}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Info className="h-4 w-4" />
                  {language === 'ar' ? 'اقتراحات التحسين' : 'Improvement Suggestions'}
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seoScore >= 80 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'رائع! مقالك محسّن بشكل ممتاز لمحركات البحث' : 'Great! Your article is well optimized for search engines'}
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

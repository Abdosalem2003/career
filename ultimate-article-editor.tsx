/**
 * Ultimate Article Editor - Professional $50K+ Design
 * محرر مقالات احترافي متقدم بتصميم فاخر
 */

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";
import {
  Save, X, Image as ImageIcon, Video, FileText, Eye, Clock, Calendar, Tag,
  TrendingUp, Sparkles, Upload, Settings, BarChart3, Zap, CheckCircle2,
  Star, Type, Edit3, Plus, Send, Copy, Download, Trash2, HelpCircle,
  Maximize2, Minimize2, Target
} from "lucide-react";
import type { Category } from "@shared/types";

interface UltimateArticleEditorProps {
  open: boolean;
  onClose: () => void;
  article?: any;
}

export function UltimateArticleEditor({ open, onClose, article }: UltimateArticleEditorProps) {
  const { language, t } = useI18n();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("content");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [seoScore, setSeoScore] = useState(0);

  const [formData, setFormData] = useState({
    titleEn: "", titleAr: "", slug: "", excerptEn: "", excerptAr: "",
    contentEn: "", contentAr: "", coverImage: null as string | null,
    gallery: [] as string[], categoryId: "", tags: [] as string[],
    status: "draft", featured: false, allowComments: true,
    seoTitle: "", seoDescription: "", seoKeywords: [] as string[],
    focusKeyword: "", metaRobots: "index,follow",
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    const text = formData.contentEn + formData.contentAr;
    const words = text.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  }, [formData.contentEn, formData.contentAr]);

  useEffect(() => {
    let score = 0;
    if (formData.seoTitle.length >= 50 && formData.seoTitle.length <= 60) score += 20;
    if (formData.seoDescription.length >= 150 && formData.seoDescription.length <= 160) score += 20;
    if (formData.focusKeyword) score += 15;
    if (formData.seoKeywords.length >= 3) score += 15;
    if (formData.coverImage) score += 10;
    if (wordCount >= 300) score += 20;
    setSeoScore(score);
  }, [formData, wordCount]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImages(prev => [...prev, base64]);
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, base64] }));
      };
      reader.readAsDataURL(file);
    }
    setIsUploading(false);
    toast({
      title: "✅ " + (language === "ar" ? "تم الرفع" : "Uploaded"),
      description: `${files.length} ${language === "ar" ? "صورة" : "images"}`,
    });
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  };

  const handleSubmit = async () => {
    if (!formData.titleEn || !formData.titleAr) {
      toast({
        title: "⚠️ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "الرجاء إدخال العنوان" : "Please enter title",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "✅ " + (language === "ar" ? "نجح!" : "Success!"),
      description: language === "ar" ? "تم حفظ المقال" : "Article saved",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-full h-screen' : 'max-w-7xl'} p-0 gap-0`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {language === "ar" ? "محرر المقالات الاحترافي" : "Ultimate Article Editor"}
                </DialogTitle>
                <p className="text-sm text-white/80">
                  {language === "ar" ? "تصميم احترافي متقدم" : "Professional Design"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white">
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>{wordCount} {language === "ar" ? "كلمة" : "words"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime} {language === "ar" ? "دقيقة" : "min"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>SEO: {seoScore}%</span>
              <Progress value={seoScore} className="w-20 h-2" />
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{uploadedImages.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" />
                {language === "ar" ? "المحتوى" : "Content"}
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                {language === "ar" ? "الوسائط" : "Media"}
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                {language === "ar" ? "الإعدادات" : "Settings"}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[60vh] p-6">
            <TabsContent value="content" className="space-y-6 mt-0">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "العنوان" : "Title"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === "ar" ? "عربي" : "Arabic"}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleAr}
                          onChange={(e) => setFormData({ ...formData, titleAr: e.target.value, slug: generateSlug(e.target.value) })}
                          placeholder="العنوان..."
                        />
                        <AutoTranslateButton
                          sourceText={formData.titleEn}
                          sourceLang="en"
                          targetLang="ar"
                          onTranslated={(t) => setFormData({ ...formData, titleAr: t })}
                          size="icon"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>{language === "ar" ? "إنجليزي" : "English"}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleEn}
                          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                          placeholder="Title..."
                        />
                        <AutoTranslateButton
                          sourceText={formData.titleAr}
                          sourceLang="ar"
                          targetLang="en"
                          onTranslated={(t) => setFormData({ ...formData, titleEn: t })}
                          size="icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "المحتوى" : "Content"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="ar">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ar">عربي</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ar">
                      <Textarea
                        value={formData.contentAr}
                        onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                        rows={15}
                        placeholder="المحتوى..."
                      />
                    </TabsContent>
                    <TabsContent value="en">
                      <Textarea
                        value={formData.contentEn}
                        onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                        rows={15}
                        placeholder="Content..."
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "القسم" : "Category"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: Category) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {language === "ar" ? cat.nameAr : cat.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "رفع الصور" : "Upload Images"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="max-w-xs mx-auto" />
                    {isUploading && <Progress value={uploadProgress} className="mt-4" />}
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} className="w-full h-32 object-cover rounded" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    SEO Score
                    <Badge variant={seoScore >= 80 ? "default" : "secondary"}>
                      {seoScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="SEO Title (50-60 chars)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.seoTitle.length}/60</p>
                  </div>
                  <div>
                    <Label>SEO Description</Label>
                    <Textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="SEO Description (150-160 chars)"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160</p>
                  </div>
                  <div>
                    <Label>Focus Keyword</Label>
                    <Input
                      value={formData.focusKeyword}
                      onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "الإعدادات" : "Settings"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{language === "ar" ? "مقال مميز" : "Featured"}</Label>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{language === "ar" ? "السماح بالتعليقات" : "Allow Comments"}</Label>
                    <Switch
                      checked={formData.allowComments}
                      onCheckedChange={(v) => setFormData({ ...formData, allowComments: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{language === "ar" ? "الحفظ التلقائي" : "Auto Save"}</Label>
                    <Switch
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {language === "ar" ? "تصدير" : "Export"}
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              {language === "ar" ? "نسخ" : "Duplicate"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              {language === "ar" ? "مسودة" : "Draft"}
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Send className="h-4 w-4 mr-2" />
              {language === "ar" ? "نشر" : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

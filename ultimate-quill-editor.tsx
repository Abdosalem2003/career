/**
 * Ultimate Quill Editor with Free AI Translation
 * محرر Quill احترافي مع ترجمة AI مجانية
 * 
 * Features:
 * - Full Quill features support
 * - Free unlimited AI translation (MyMemory API)
 * - Professional design
 * - Fully responsive
 * - Auto-save
 * - Real-time stats
 */

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import {
  X, Send, FileText, Image as ImageIcon, Settings, Type, Clock, 
  Target, Sparkles, Languages, Loader2, CheckCircle2, Save
} from "lucide-react";

import type { Category } from "@shared/types";

interface UltimateQuillEditorProps {
  open: boolean;
  onClose: () => void;
}

// Free AI Translation using MyMemory API (unlimited, no API key needed)
async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    // Remove HTML tags for translation
    const plainText = text.replace(/<[^>]*>/g, '');
    
    if (!plainText.trim()) return text;
    
    // MyMemory API - Free, unlimited, no API key
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(plainText)}&langpair=${from}|${to}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error("Translation failed");
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

// Advanced Quill modules with all features
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ],
  },
  clipboard: {
    matchVisual: false,
  },
  history: {
    delay: 1000,
    maxStack: 100,
    userOnly: true
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'blockquote', 'code-block',
  'link', 'image', 'video', 'formula'
];

export function UltimateQuillEditor({ open, onClose }: UltimateQuillEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("content");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    contentEn: "",
    contentAr: "",
    excerptEn: "",
    excerptAr: "",
    coverImage: null as string | null,
    categoryId: "",
    tags: [] as string[],
    status: "published" as "draft" | "published",
    featured: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  // Calculate stats
  useEffect(() => {
    const text = (formData.contentEn + formData.contentAr).replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200));
    
    // Calculate SEO
    let score = 0;
    if (formData.titleEn && formData.titleAr) score += 25;
    if (formData.coverImage) score += 20;
    if (words.length >= 300) score += 25;
    if (formData.tags.length >= 3) score += 15;
    if (formData.categoryId) score += 15;
    setSeoScore(score);
  }, [formData]);

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !open) return;
    const timer = setTimeout(() => {
      localStorage.setItem('article-draft', JSON.stringify(formData));
      setLastSaved(new Date());
    }, 30000);
    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled, open]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create article");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/latest"] });
      localStorage.removeItem('article-draft');
      
      toast({
        title: "✅ " + (language === "ar" ? "تم النشر بنجاح!" : "Published Successfully!"),
        description: language === "ar" ? "تم نشر المقال بنجاح" : "Article published successfully",
      });
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "❌ " + (language === "ar" ? "خطأ" : "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titleEn: "", titleAr: "", slug: "", contentEn: "", contentAr: "",
      excerptEn: "", excerptAr: "", coverImage: null, categoryId: "",
      tags: [], status: "published", featured: false,
    });
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const generateExcerpt = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.substring(0, 160);
  };

  // AI Translation Handler
  const handleTranslate = async (field: 'title' | 'content' | 'excerpt', direction: 'ar-to-en' | 'en-to-ar') => {
    setIsTranslating(true);
    
    try {
      const [from, to] = direction === 'ar-to-en' ? ['ar', 'en'] : ['en', 'ar'];
      
      let sourceText = "";
      if (field === 'title') {
        sourceText = direction === 'ar-to-en' ? formData.titleAr : formData.titleEn;
      } else if (field === 'content') {
        sourceText = direction === 'ar-to-en' ? formData.contentAr : formData.contentEn;
      } else if (field === 'excerpt') {
        sourceText = direction === 'ar-to-en' ? formData.excerptAr : formData.excerptEn;
      }
      
      if (!sourceText) {
        toast({
          title: "⚠️ " + (language === "ar" ? "تنبيه" : "Warning"),
          description: language === "ar" ? "لا يوجد نص للترجمة" : "No text to translate",
          variant: "destructive",
        });
        setIsTranslating(false);
        return;
      }
      
      const translated = await translateText(sourceText, from, to);
      
      if (field === 'title') {
        if (direction === 'ar-to-en') {
          setFormData({ ...formData, titleEn: translated });
        } else {
          setFormData({ ...formData, titleAr: translated });
        }
      } else if (field === 'content') {
        if (direction === 'ar-to-en') {
          setFormData({ ...formData, contentEn: translated });
        } else {
          setFormData({ ...formData, contentAr: translated });
        }
      } else if (field === 'excerpt') {
        if (direction === 'ar-to-en') {
          setFormData({ ...formData, excerptEn: translated });
        } else {
          setFormData({ ...formData, excerptAr: translated });
        }
      }
      
      toast({
        title: "✅ " + (language === "ar" ? "تمت الترجمة" : "Translated"),
        description: language === "ar" ? "تمت الترجمة بنجاح" : "Translation successful",
      });
    } catch (error) {
      toast({
        title: "❌ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "فشلت الترجمة" : "Translation failed",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "⚠️ " + (language === "ar" ? "حجم كبير" : "Large file"),
        description: language === "ar" ? "الحد الأقصى 5MB" : "Max 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, coverImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.titleEn || !formData.titleAr) {
      toast({
        title: "⚠️ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "الرجاء إدخال العنوان" : "Please enter title",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "⚠️ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "الرجاء اختيار القسم" : "Please select category",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      authorId: currentUser?.id,
      authorName: currentUser?.name,
      readingTime,
      excerptEn: formData.excerptEn || generateExcerpt(formData.contentEn),
      excerptAr: formData.excerptAr || generateExcerpt(formData.contentAr),
    };

    createMutation.mutate(submitData);
  };

  const getSEOColor = () => {
    if (seoScore >= 80) return "bg-green-500";
    if (seoScore >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] md:max-w-6xl h-[98vh] p-0 gap-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">
                  {language === "ar" ? "محرر Quill الاحترافي" : "Ultimate Quill Editor"}
                </h2>
                <p className="text-sm text-white/80">
                  {language === "ar" ? "مع ترجمة AI مجانية غير محدودة" : "With Free Unlimited AI Translation"}
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
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
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
              <Badge className={`${getSEOColor()} text-white`}>SEO: {seoScore}%</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span>{language === "ar" ? "ترجمة AI مجانية" : "Free AI Translation"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b bg-gray-50 dark:bg-gray-800/50 px-4">
            <TabsList className="bg-transparent">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                {language === "ar" ? "المحتوى" : "Content"}
              </TabsTrigger>
              <TabsTrigger value="media">
                <ImageIcon className="h-4 w-4 mr-2" />
                {language === "ar" ? "الوسائط" : "Media"}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                {language === "ar" ? "إعدادات" : "Settings"}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900">
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
              <TabsContent value="content" className="space-y-6 mt-0">
                {/* Title with AI Translation */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <Label className="text-lg font-semibold mb-4 block">
                    {language === "ar" ? "العنوان" : "Title"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 block">{language === "ar" ? "عربي" : "Arabic"}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleAr}
                          onChange={(e) => setFormData({
                            ...formData,
                            titleAr: e.target.value,
                            slug: generateSlug(e.target.value)
                          })}
                          placeholder="العنوان..."
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleTranslate('title', 'en-to-ar')}
                          disabled={isTranslating}
                        >
                          {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">{language === "ar" ? "إنجليزي" : "English"}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleEn}
                          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                          placeholder="Title..."
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleTranslate('title', 'ar-to-en')}
                          disabled={isTranslating}
                        >
                          {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm mb-2 block">Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </Card>

                {/* Content with Quill Editor */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <Label className="text-lg font-semibold mb-4 block">
                    {language === "ar" ? "المحتوى" : "Content"}
                  </Label>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">{language === "ar" ? "عربي" : "Arabic"}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTranslate('content', 'en-to-ar')}
                          disabled={isTranslating}
                        >
                          {isTranslating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Languages className="h-4 w-4 mr-2" />}
                          {language === "ar" ? "ترجمة من الإنجليزية" : "Translate from English"}
                        </Button>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={formData.contentAr}
                        onChange={(content) => setFormData({ ...formData, contentAr: content })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-96 bg-white dark:bg-gray-900"
                      />
                    </div>

                    <div className="pt-20">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">{language === "ar" ? "إنجليزي" : "English"}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTranslate('content', 'ar-to-en')}
                          disabled={isTranslating}
                        >
                          {isTranslating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Languages className="h-4 w-4 mr-2" />}
                          {language === "ar" ? "ترجمة من العربية" : "Translate from Arabic"}
                        </Button>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={formData.contentEn}
                        onChange={(content) => setFormData({ ...formData, contentEn: content })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-96 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </Card>

                {/* Category & Tags */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 block">{language === "ar" ? "القسم" : "Category"} *</Label>
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
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">{language === "ar" ? "الوسوم" : "Tags"}</Label>
                      <Input
                        placeholder={language === "ar" ? "أضف وسم..." : "Add tag..."}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            setFormData({ ...formData, tags: [...formData.tags, e.currentTarget.value] });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                          <button
                            onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, idx) => idx !== i) })}
                            className="ml-2"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <Label className="text-lg font-semibold mb-4 block">
                    {language === "ar" ? "صورة الغلاف" : "Cover Image"}
                  </Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover" className="mt-4 w-full h-64 object-cover rounded-lg" />
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <Label className="text-lg font-semibold mb-4 block">
                    {language === "ar" ? "إعدادات" : "Settings"}
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span>{language === "ar" ? "الناشر" : "Author"}</span>
                      <Badge>{currentUser?.name || "Unknown"}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span>{language === "ar" ? "حفظ تلقائي" : "Auto-save"}</span>
                      <Button
                        size="sm"
                        variant={autoSaveEnabled ? "default" : "outline"}
                        onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                      >
                        {autoSaveEnabled ? "✓" : "✗"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="border-t bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('article-draft', JSON.stringify(formData));
                setLastSaved(new Date());
                toast({ title: "💾 " + (language === "ar" ? "تم الحفظ" : "Saved") });
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Send className="h-4 w-4 mr-2" />
              {createMutation.isPending
                ? (language === "ar" ? "جاري النشر..." : "Publishing...")
                : (language === "ar" ? "نشر" : "Publish")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

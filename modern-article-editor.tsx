/**
 * Modern White Article Editor
 * محرر مقالات عصري أبيض احترافي
 * 
 * Features:
 * - Clean white design
 * - Modern tabs
 * - Fully responsive
 * - Auto-link to author
 * - Real-time stats
 * - Professional UI/UX
 */

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";
import { quillModules, quillFormats } from "@/components/admin/quill-editor/quill-config";

import {
  X, Send, FileText, Image as ImageIcon, Settings, Type, Clock, Target, Sparkles
} from "lucide-react";

import type { Category } from "@shared/types";

interface ModernArticleEditorProps {
  open: boolean;
  onClose: () => void;
}

export function ModernArticleEditor({ open, onClose }: ModernArticleEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("content");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [seoScore, setSeoScore] = useState(0);

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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("[FRONTEND] Sending article data:", data);
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
      
      const result = await response.json();
      console.log("[FRONTEND] Article created:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("[FRONTEND] Success! Article ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/featured"] });
      
      toast({
        title: "✅ " + (language === "ar" ? "تم النشر بنجاح!" : "Published Successfully!"),
        description: language === "ar" 
          ? `تم نشر المقال "${formData.titleAr}" بنجاح` 
          : `Article "${formData.titleEn}" published successfully`,
      });
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.error("[FRONTEND] Error:", error);
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
    // Validation
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
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    console.log("[FRONTEND] Submitting with author:", currentUser?.name, currentUser?.id);
    createMutation.mutate(submitData);
  };

  const getSEOColor = () => {
    if (seoScore >= 80) return "bg-green-500";
    if (seoScore >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] md:max-w-5xl h-[98vh] p-0 gap-0 bg-white dark:bg-gray-900">
        {/* Clean White Header */}
        <div className="bg-white dark:bg-gray-900 border-b p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {language === "ar" ? "إنشاء مقال جديد" : "Create New Article"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.name && (
                    <span>{language === "ar" ? "الناشر: " : "Author: "}{currentUser.name}</span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {wordCount} {language === "ar" ? "كلمة" : "words"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {readingTime} {language === "ar" ? "دقيقة" : "min"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">SEO:</span>
                <Badge className={`${getSEOColor()} text-white`}>{seoScore}%</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b bg-gray-50 dark:bg-gray-800/50 px-4 md:px-6">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-1">
              <TabsTrigger 
                value="content" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-t-lg px-4 md:px-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{language === "ar" ? "المحتوى" : "Content"}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-t-lg px-4 md:px-6"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{language === "ar" ? "الوسائط" : "Media"}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-t-lg px-4 md:px-6"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{language === "ar" ? "إعدادات" : "Settings"}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900">
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
              <TabsContent value="content" className="space-y-6 mt-0">
                {/* Title */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border">
                  <Label className="text-base font-semibold mb-4 block">
                    {language === "ar" ? "العنوان" : "Title"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                        {language === "ar" ? "عربي" : "Arabic"} *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleAr}
                          onChange={(e) => setFormData({
                            ...formData,
                            titleAr: e.target.value,
                            slug: generateSlug(e.target.value)
                          })}
                          placeholder="العنوان..."
                          className="h-11"
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
                      <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                        {language === "ar" ? "إنجليزي" : "English"} *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.titleEn}
                          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                          placeholder="Title..."
                          className="h-11"
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
                  <div className="mt-4">
                    <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border">
                  <Label className="text-base font-semibold mb-4 block">
                    {language === "ar" ? "المحتوى" : "Content"}
                  </Label>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "عربي" : "Arabic"}
                        </Label>
                        <AutoTranslateButton
                          sourceText={formData.contentEn}
                          sourceLang="en"
                          targetLang="ar"
                          onTranslated={(t) => setFormData({ ...formData, contentAr: t })}
                          isHTML={true}
                          size="sm"
                        />
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={formData.contentAr}
                        onChange={(content) => setFormData({ ...formData, contentAr: content })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-64 bg-white dark:bg-gray-900"
                      />
                    </div>

                    <div className="pt-16">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "إنجليزي" : "English"}
                        </Label>
                        <AutoTranslateButton
                          sourceText={formData.contentAr}
                          sourceLang="ar"
                          targetLang="en"
                          onTranslated={(t) => setFormData({ ...formData, contentEn: t })}
                          isHTML={true}
                          size="sm"
                        />
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={formData.contentEn}
                        onChange={(content) => setFormData({ ...formData, contentEn: content })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-64 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                        {language === "ar" ? "القسم" : "Category"} *
                      </Label>
                      <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={language === "ar" ? "اختر القسم" : "Select category"} />
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
                      <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                        {language === "ar" ? "الوسوم" : "Tags"}
                      </Label>
                      <Input
                        placeholder={language === "ar" ? "أضف وسم واضغط Enter" : "Add tag and press Enter"}
                        className="h-11"
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
                        <Badge key={i} variant="secondary" className="px-3 py-1">
                          {tag}
                          <button
                            onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, idx) => idx !== i) })}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border">
                  <Label className="text-base font-semibold mb-4 block">
                    {language === "ar" ? "صورة الغلاف" : "Cover Image"}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="h-11"
                  />
                  {formData.coverImage && (
                    <div className="mt-4">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border">
                  <Label className="text-base font-semibold mb-4 block">
                    {language === "ar" ? "معلومات إضافية" : "Additional Info"}
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm font-medium">
                        {language === "ar" ? "الناشر" : "Author"}
                      </span>
                      <Badge variant="secondary">{currentUser?.name || "Unknown"}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm font-medium">
                        {language === "ar" ? "الحالة" : "Status"}
                      </span>
                      <Badge className="bg-green-500 text-white">
                        {language === "ar" ? "منشور" : "Published"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="border-t bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {createMutation.isPending
              ? (language === "ar" ? "جاري النشر..." : "Publishing...")
              : (language === "ar" ? "نشر المقال" : "Publish Article")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

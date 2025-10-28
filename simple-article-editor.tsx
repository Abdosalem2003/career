/**
 * Simple Professional Article Editor
 * محرر مقالات بسيط واحترافي
 */

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";
import { quillModules, quillFormats } from "@/components/admin/quill-editor/quill-config";

import { Save, X, Sparkles, Image as ImageIcon, Send } from "lucide-react";
import type { Category } from "@shared/types";

interface SimpleArticleEditorProps {
  open: boolean;
  onClose: () => void;
}

export function SimpleArticleEditor({ open, onClose }: SimpleArticleEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    status: "published",
    featured: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/latest"] });
      toast({
        title: "✅ " + (language === "ar" ? "تم النشر!" : "Published!"),
        description: language === "ar" ? "تم نشر المقال بنجاح" : "Article published successfully",
      });
      onClose();
      setFormData({
        titleEn: "", titleAr: "", slug: "", contentEn: "", contentAr: "",
        excerptEn: "", excerptAr: "", coverImage: null, categoryId: "",
        tags: [], status: "published", featured: false,
      });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "❌ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "فشل نشر المقال" : "Failed to publish article",
        variant: "destructive",
      });
    },
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, coverImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.titleEn || !formData.titleAr || !formData.categoryId) {
      toast({
        title: "⚠️ " + (language === "ar" ? "خطأ" : "Error"),
        description: language === "ar" ? "الرجاء ملء الحقول المطلوبة" : "Please fill required fields",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      authorId: "1", // Replace with actual user ID
      readingTime: Math.ceil((formData.contentEn + formData.contentAr).split(/\s+/).length / 200),
    };

    createMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <DialogTitle className="text-xl">
                {language === "ar" ? "إنشاء مقال جديد" : "Create New Article"}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} *</Label>
                <div className="flex gap-2 mt-1">
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
                <Label className="text-sm font-medium">{language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Title..."
                    className="flex-1"
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
              <Label className="text-sm font-medium">Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-slug"
                className="mt-1"
              />
            </div>
          </Card>

          {/* Content */}
          <Card className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">{language === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}</Label>
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
                className="h-64"
              />
            </div>

            <div className="pt-16">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">{language === "ar" ? "المحتوى (إنجليزي)" : "Content (English)"}</Label>
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
                className="h-64"
              />
            </div>
          </Card>

          {/* Meta */}
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{language === "ar" ? "القسم" : "Category"} *</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                  <SelectTrigger className="mt-1">
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
                <Label className="text-sm font-medium">{language === "ar" ? "صورة الغلاف" : "Cover Image"}</Label>
                <div className="mt-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover" className="mt-2 h-20 w-32 object-cover rounded" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">{language === "ar" ? "الوسوم" : "Tags"}</Label>
              <Input
                placeholder={language === "ar" ? "أضف وسم واضغط Enter" : "Add tag and press Enter"}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    setFormData({ ...formData, tags: [...formData.tags, e.currentTarget.value] });
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                    <button
                      onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, idx) => idx !== i) })}
                      className="ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
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

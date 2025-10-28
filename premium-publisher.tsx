import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Check, Image as ImageIcon, Sparkles, Save } from "lucide-react";
import type { Category } from "@shared/types";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  excerptEn?: string;
  excerptAr?: string;
  contentEn: string;
  contentAr: string;
  categoryId: string;
  status: string;
  featured: boolean;
  tags?: string[];
}

interface ModernArticleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModernArticleEditor({ open, onOpenChange }: ModernArticleEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("basic");
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    excerptEn: "",
    excerptAr: "",
    contentEn: "",
    contentAr: "",
    categoryId: "",
    status: "draft",
    featured: false,
    tags: [] as string[],
  });


  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, authorId: "admin-id" }),
      });
      if (!response.ok) throw new Error("Failed to create article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "ar" ? "✨ تم النشر" : "✨ Published",
        description: language === "ar" ? "تم إنشاء المقال بنجاح" : "Article created successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: language === "ar" ? "فشل إنشاء المقال" : "Failed to create article",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            {language === "ar" ? "إنشاء مقال جديد" : "Create New Article"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                {language === "ar" ? "المعلومات الأساسية" : "Basic Info"}
              </TabsTrigger>
              <TabsTrigger value="content">
                {language === "ar" ? "المحتوى" : "Content"}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {language === "ar" ? "الإعدادات" : "Settings"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      className="text-lg flex-1"
                      required
                    />
                    <AutoTranslateButton
                      sourceText={formData.titleEn}
                      sourceLang="en"
                      targetLang="ar"
                      onTranslated={(translated) => setFormData({ ...formData, titleAr: translated })}
                      label="🤖"
                      size="icon"
                      variant="outline"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      className="text-lg flex-1"
                      required
                    />
                    <AutoTranslateButton
                      sourceText={formData.titleAr}
                      sourceLang="ar"
                      targetLang="en"
                      onTranslated={(translated) => setFormData({ ...formData, titleEn: translated })}
                      label="🤖"
                      size="icon"
                      variant="outline"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {language === "ar" ? "الرابط (Slug)" : "Slug"}
                </Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {language === "ar" ? "المقتطف (عربي)" : "Excerpt (Arabic)"}
                    </Label>
                    <AutoTranslateButton
                      sourceText={formData.excerptEn || ""}
                      sourceLang="en"
                      targetLang="ar"
                      onTranslated={(translated) => setFormData({ ...formData, excerptAr: translated })}
                      size="sm"
                    />
                  </div>
                  <Textarea
                    value={formData.excerptAr}
                    onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {language === "ar" ? "المقتطف (إنجليزي)" : "Excerpt (English)"}
                    </Label>
                    <AutoTranslateButton
                      sourceText={formData.excerptAr || ""}
                      sourceLang="ar"
                      targetLang="en"
                      onTranslated={(translated) => setFormData({ ...formData, excerptEn: translated })}
                      size="sm"
                    />
                  </div>
                  <Textarea
                    value={formData.excerptEn}
                    onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {language === "ar" ? "القسم" : "Category"}
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as Category[] || []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {language === "ar" ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}
                  </Label>
                  <Textarea
                    value={formData.contentAr}
                    onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                    rows={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "المحتوى (إنجليزي)" : "Content (English)"}
                  </Label>
                  <Textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    rows={15}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {language === "ar" ? "الوسوم" : "Tags"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={language === "ar" ? "أضف وسم" : "Add tag"}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    {language === "ar" ? "إضافة" : "Add"}
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "الحالة" : "Status"}
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{language === "ar" ? "مسودة" : "Draft"}</SelectItem>
                      <SelectItem value="published">{language === "ar" ? "منشور" : "Published"}</SelectItem>
                      <SelectItem value="archived">{language === "ar" ? "مؤرشف" : "Archived"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <Label className="text-base font-semibold">
                      {language === "ar" ? "مقال مميز" : "Featured Article"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "سيظهر في الصفحة الرئيسية" : "Will appear on homepage"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending
                ? (language === "ar" ? "جاري النشر..." : "Publishing...")
                : (language === "ar" ? "نشر المقال" : "Publish Article")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

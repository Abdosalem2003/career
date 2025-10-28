import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  X,
  Upload,
  Sparkles,
  FileText,
  Globe,
  Tag,
  Calendar,
  User,
  Loader2,
  Images,
  BarChart3,
  Plus,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditArticle() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Form state
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [excerptAr, setExcerptAr] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [specialReport, setSpecialReport] = useState(false);
  const [breakingNews, setBreakingNews] = useState(false);
  const [topNews, setTopNews] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");
  
  // Gallery state (ألبوم الصور)
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // Poll state (استطلاع الرأي)
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch article if editing
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: [`/api/admin/articles/${id}`],
    enabled: isEditMode,
    queryFn: async () => {
      const res = await fetch(`/api/articles`);
      if (!res.ok) throw new Error("Failed to fetch article");
      const articles = await res.json();
      return articles.find((a: any) => a.id === id);
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Populate form when article loads
  useEffect(() => {
    if (article) {
      setTitleAr(article.titleAr || "");
      setTitleEn(article.titleEn || "");
      setSlug(article.slug || "");
      setExcerptAr(article.excerptAr || "");
      setExcerptEn(article.excerptEn || "");
      setContentAr(article.contentAr || "");
      setContentEn(article.contentEn || "");
      setCategoryId(article.categoryId || "");
      setStatus(article.status || "draft");
      setFeatured(article.featured || false);
      setSpecialReport(article.specialReport || false);
      setBreakingNews((article as any).breakingNews || false);
      setTopNews((article as any).topNews || false);
      setCoverImage(article.coverImage || "");
      setCoverImagePreview(article.coverImage || "");
      setTags(article.tags || []);
      
      // Load gallery
      setGallery(article.gallery || []);
      setGalleryPreviews(article.gallery || []);
      
      // Load poll if exists
      if (article.poll) {
        setHasPoll(true);
        setPollQuestion(article.poll.question || "");
        setPollOptions(article.poll.options || ["", ""]);
      }
    }
  }, [article]);

  // Auto-generate slug from Arabic title
  useEffect(() => {
    if (titleAr && !isEditMode) {
      const generatedSlug = titleAr
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
      setSlug(generatedSlug);
    }
  }, [titleAr, isEditMode]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditMode
        ? `/api/admin/articles/${id}`
        : "/api/dash-unnt-2025/articles";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save article");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Saved",
        description: isEditMode
          ? language === "ar"
            ? "تم تحديث المقال بنجاح"
            : "Article updated successfully"
          : language === "ar"
          ? "تم إنشاء المقال بنجاح"
          : "Article created successfully",
      });
      setLocation("/dash-unnt-2025/articles");
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!titleAr || !titleEn || !slug || !categoryId) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "يرجى ملء جميع الحقول المطلوبة"
            : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate poll if enabled
    if (hasPoll) {
      if (!pollQuestion.trim()) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            language === "ar"
              ? "يرجى إدخال سؤال الاستطلاع"
              : "Please enter poll question",
          variant: "destructive",
        });
        return;
      }
      
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            language === "ar"
              ? "يجب إضافة خيارين على الأقل"
              : "Please add at least 2 options",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    saveMutation.mutate({
      titleAr,
      titleEn,
      slug,
      excerptAr,
      excerptEn,
      contentAr,
      contentEn,
      categoryId,
      status,
      featured,
      specialReport,
      breakingNews,
      topNews,
      coverImage,
      gallery,
      tags,
      poll: hasPoll ? {
        question: pollQuestion,
        options: pollOptions.filter(opt => opt.trim()),
        votes: pollOptions.filter(opt => opt.trim()).map(() => 0),
      } : null,
      publishedAt: status === "published" ? new Date().toISOString() : null,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حجم الصورة يجب أن يكون أقل من 5MB"
            : "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCoverImagePreview(base64);

      // Upload to server
      try {
        const res = await fetch("/api/dash-unnt-2025/media/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            base64,
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to upload image");
        }

        const data = await res.json();
        setCoverImage(data.url);
        toast({
          title: language === "ar" ? "تم الرفع ✓" : "Uploaded ✓",
          description:
            language === "ar"
              ? "تم رفع الصورة بنجاح"
              : "Image uploaded successfully",
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: error.message || (language === "ar" ? "فشل رفع الصورة" : "Failed to upload image"),
          variant: "destructive",
        });
        setCoverImagePreview(""); // Clear preview on error
      }
    };
    reader.readAsDataURL(file);
  };

  // Gallery upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: `${file.name}: ${
            language === "ar"
              ? "حجم الصورة يجب أن يكون أقل من 5MB"
              : "Image size must be less than 5MB"
          }`,
          variant: "destructive",
        });
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Add preview immediately
        setGalleryPreviews(prev => [...prev, base64]);

        try {
          const res = await fetch("/api/dash-unnt-2025/media/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              base64,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to upload image");
          }

          const data = await res.json();
          setGallery(prev => [...prev, data.url]);
        } catch (error: any) {
          console.error("Gallery upload error:", error);
          toast({
            title: language === "ar" ? "خطأ" : "Error",
            description: `${file.name}: ${error.message || (language === "ar" ? "فشل رفع الصورة" : "Failed to upload image")}`,
            variant: "destructive",
          });
          setGalleryPreviews(prev => prev.filter(p => p !== base64));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Poll functions
  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (articleLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dash-unnt-2025/articles")}
            className="hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isEditMode
                ? language === "ar"
                  ? "تعديل المقال"
                  : "Edit Article"
                : language === "ar"
                ? "مقال جديد"
                : "New Article"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {language === "ar"
                ? "املأ التفاصيل أدناه"
                : "Fill in the details below"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/dash-unnt-2025/articles")}
                className="rounded-full"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || saveMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg shadow-blue-500/30"
              >
                {saving || saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {language === "ar" ? "حفظ" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "صورة الغلاف" : "Cover Image"}
                  </Label>
                </div>

                {coverImagePreview ? (
                  <div className="relative group">
                    <img
                      src={coverImagePreview}
                      alt="Cover"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCoverImage("");
                          setCoverImagePreview("");
                        }}
                        className="rounded-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === "ar" ? "إزالة" : "Remove"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-600">
                      {language === "ar"
                        ? "اضغط لرفع صورة"
                        : "Click to upload image"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {language === "ar"
                        ? "PNG, JPG, WEBP (حتى 5MB)"
                        : "PNG, JPG, WEBP (up to 5MB)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </Card>

            {/* Gallery (ألبوم الصور) */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-semibold">
                      {language === "ar" ? "ألبوم الصور" : "Image Gallery"}
                    </Label>
                  </div>
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = document.getElementById("gallery-upload") as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "ar" ? "إضافة صور" : "Add Images"}
                    </Button>
                    <input
                      id="gallery-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                    />
                  </label>
                </div>

                {galleryPreviews.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeGalleryImage(index)}
                            className="rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                    {language === "ar"
                      ? "لم يتم إضافة صور بعد"
                      : "No images added yet"}
                  </div>
                )}
              </div>
            </Card>

            {/* Titles */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "العنوان" : "Title"}
                  </Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">
                      {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder={
                        language === "ar"
                          ? "أدخل العنوان بالعربية"
                          : "Enter title in Arabic"
                      }
                      className="mt-1.5 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">
                      {language === "ar"
                        ? "العنوان (إنجليزي)"
                        : "Title (English)"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder={
                        language === "ar"
                          ? "أدخل العنوان بالإنجليزية"
                          : "Enter title in English"
                      }
                      className="mt-1.5 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">
                      {language === "ar" ? "الرابط (Slug)" : "Slug"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="article-slug"
                      className="mt-1.5 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Excerpts */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "المقتطف" : "Excerpt"}
                  </Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">
                      {language === "ar"
                        ? "المقتطف (عربي)"
                        : "Excerpt (Arabic)"}
                    </Label>
                    <Textarea
                      value={excerptAr}
                      onChange={(e) => setExcerptAr(e.target.value)}
                      placeholder={
                        language === "ar"
                          ? "ملخص قصير للمقال بالعربية"
                          : "Short summary in Arabic"
                      }
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">
                      {language === "ar"
                        ? "المقتطف (إنجليزي)"
                        : "Excerpt (English)"}
                    </Label>
                    <Textarea
                      value={excerptEn}
                      onChange={(e) => setExcerptEn(e.target.value)}
                      placeholder={
                        language === "ar"
                          ? "ملخص قصير للمقال بالإنجليزية"
                          : "Short summary in English"
                      }
                      className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "المحتوى" : "Content"}
                  </Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      {language === "ar"
                        ? "المحتوى (عربي)"
                        : "Content (Arabic)"}
                    </Label>
                    <div className="rounded-xl overflow-hidden border border-gray-200" dir="rtl">
                      <ReactQuill
                        value={contentAr}
                        onChange={setContentAr}
                        theme="snow"
                        className="bg-white"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ align: [] }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      {language === "ar"
                        ? "المحتوى (إنجليزي)"
                        : "Content (English)"}
                    </Label>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <ReactQuill
                        value={contentEn}
                        onChange={setContentEn}
                        theme="snow"
                        className="bg-white"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ align: [] }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card className="p-6 border-0 shadow-lg shadow-gray-200/50 rounded-2xl bg-white sticky top-24">
              <div className="space-y-6">
                <h3 className="text-base font-semibold">
                  {language === "ar" ? "الإعدادات" : "Settings"}
                </h3>

                {/* Category */}
                <div>
                  <Label className="text-sm text-gray-600">
                    {language === "ar" ? "القسم" : "Category"}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl border-gray-200">
                      <SelectValue
                        placeholder={
                          language === "ar" ? "اختر القسم" : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {language === "ar" ? cat.nameAr : cat.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-sm text-gray-600">
                    {language === "ar" ? "الحالة" : "Status"}
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        {language === "ar" ? "مسودة" : "Draft"}
                      </SelectItem>
                      <SelectItem value="published">
                        {language === "ar" ? "منشور" : "Published"}
                      </SelectItem>
                      <SelectItem value="archived">
                        {language === "ar" ? "مؤرشف" : "Archived"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    <Label className="text-sm font-medium">
                      {language === "ar" ? "مقال مميز" : "Featured"}
                    </Label>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>

                {/* Special Report */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {language === "ar" ? "تقرير خاص" : "Special Report"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "عرض في قسم التقارير الخاصة" : "Show in special reports section"}
                    </p>
                  </div>
                  <Switch checked={specialReport} onCheckedChange={setSpecialReport} />
                </div>

                {/* Breaking News */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      {language === "ar" ? "خبر عاجل" : "Breaking News"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "عرض في شريط الأخبار العاجلة أعلى الصفحة" 
                        : "Show in breaking news ticker at the top"}
                    </p>
                  </div>
                  <Switch 
                    checked={breakingNews} 
                    onCheckedChange={setBreakingNews}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>

                {/* Top News */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                      {language === "ar" ? "أهم الأخبار" : "Top News"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "عرض في قسم أهم الأخبار (أفضل 100 خبر)" 
                        : "Show in top news section (top 100 articles)"}
                    </p>
                  </div>
                  <Switch 
                    checked={topNews} 
                    onCheckedChange={setTopNews}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">
                    <Tag className="h-4 w-4 inline mr-1" />
                    {language === "ar" ? "الوسوم" : "Tags"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      placeholder={
                        language === "ar" ? "أضف وسم" : "Add tag"
                      }
                      className="h-10 rounded-xl border-gray-200"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      size="sm"
                      className="rounded-xl"
                    >
                      {language === "ar" ? "إضافة" : "Add"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Poll Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <Label className="text-base font-semibold">
                        {language === "ar" ? "استطلاع رأي" : "Poll"}
                      </Label>
                    </div>
                    <Switch checked={hasPoll} onCheckedChange={setHasPoll} />
                  </div>

                  {hasPoll && (
                    <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div>
                        <Label className="text-sm text-gray-600">
                          {language === "ar" ? "السؤال" : "Question"}
                        </Label>
                        <Input
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder={
                            language === "ar"
                              ? "ما هو سؤالك؟"
                              : "What's your question?"
                          }
                          className="mt-1.5 h-11 rounded-xl border-gray-200"
                        />
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">
                          {language === "ar" ? "الخيارات" : "Options"}
                        </Label>
                        <div className="space-y-2">
                          {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) =>
                                  updatePollOption(index, e.target.value)
                                }
                                placeholder={`${
                                  language === "ar" ? "خيار" : "Option"
                                } ${index + 1}`}
                                className="h-10 rounded-xl border-gray-200"
                              />
                              {pollOptions.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePollOption(index)}
                                  className="rounded-xl"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                          className="mt-2 rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "ar" ? "إضافة خيار" : "Add Option"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

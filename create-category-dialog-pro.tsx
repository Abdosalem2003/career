import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Palette, FileText, Link as LinkIcon, Image as ImageIcon, Check, AlertCircle, Sparkles } from "lucide-react";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryDialogPro({ open, onOpenChange }: CreateCategoryDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    slug: "",
    bannerImage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: language === "ar" ? "✓ تم الحفظ" : "✓ Success",
        description: language === "ar" ? "تم إنشاء القسم بنجاح" : "Category created successfully",
      });
      onOpenChange(false);
      setFormData({ nameAr: "", nameEn: "", slug: "", bannerImage: "" });
      setStep(1);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء القسم" : "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const validateStep = (stepNum: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.nameAr.trim()) {
        newErrors.nameAr = language === "ar" ? "الاسم بالعربية مطلوب" : "Arabic name is required";
      }
      if (!formData.nameEn.trim()) {
        newErrors.nameEn = language === "ar" ? "الاسم بالإنجليزية مطلوب" : "English name is required";
      }
    } else if (stepNum === 2) {
      if (!formData.slug.trim()) {
        newErrors.slug = language === "ar" ? "الرابط مطلوب" : "Slug is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(2)) {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-lg -mx-6 -mt-6 px-6 py-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-white text-2xl font-black">
                {language === "ar" ? "إنشاء قسم جديد" : "Create New Category"}
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {language === "ar" ? "أضف قسم احترافي جديد لتنظيم المقالات" : "Add a professional new category to organize articles"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s === step
                    ? "bg-blue-600 text-white scale-110"
                    : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    s < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Names */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium">
                  {language === "ar" ? "ابدأ بإدخال اسم القسم بالعربية والإنجليزية" : "Start by entering the category name in Arabic and English"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {language === "ar" ? "الاسم بالعربية" : "Arabic Name"}
                </Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => {
                    setFormData({ ...formData, nameAr: e.target.value });
                    setErrors({ ...errors, nameAr: "" });
                  }}
                  placeholder={language === "ar" ? "مثال: سياسة" : "e.g., Politics"}
                  className={`h-12 rounded-lg border-2 transition-all font-medium ${
                    errors.nameAr ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.nameAr && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nameAr}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {language === "ar" ? "الاسم بالإنجليزية" : "English Name"}
                </Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => {
                    setFormData({ ...formData, nameEn: e.target.value });
                    setErrors({ ...errors, nameEn: "" });
                  }}
                  placeholder={language === "ar" ? "مثال: Politics" : "e.g., Politics"}
                  className={`h-12 rounded-lg border-2 transition-all font-medium ${
                    errors.nameEn ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.nameEn && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nameEn}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Slug and URL */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-900 font-medium">
                  {language === "ar" ? "الآن قم بتعيين رابط فريد للقسم" : "Now set a unique URL slug for the category"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <LinkIcon className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "الرابط (Slug)" : "Slug (URL)"}
                </Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: generateSlug(e.target.value) });
                    setErrors({ ...errors, slug: "" });
                  }}
                  placeholder={language === "ar" ? "مثال: politics" : "e.g., politics"}
                  className={`h-12 rounded-lg border-2 transition-all font-mono font-bold ${
                    errors.slug ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  }`}
                />
                {errors.slug && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.slug}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {language === "ar" ? "سيتم استخدام هذا الرابط في عنوان URL" : "This will be used in the URL"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  {language === "ar" ? "رابط صورة البانر" : "Banner Image URL"}
                </Label>
                <Input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {language === "ar" ? "اختياري - صورة لتمثيل القسم" : "Optional - image to represent the category"}
                </p>
              </div>
            </div>
          )}


          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step === 1) {
                  onOpenChange(false);
                  setStep(1);
                } else {
                  handlePrev();
                }
              }}
              className="px-6"
            >
              {step === 1 ? (language === "ar" ? "إلغاء" : "Cancel") : language === "ar" ? "السابق" : "Previous"}
            </Button>

            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {language === "ar" ? "التالي" : "Next"} →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={createMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {createMutation.isPending
                  ? language === "ar"
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : language === "ar"
                  ? "✓ حفظ القسم"
                  : "✓ Save Category"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

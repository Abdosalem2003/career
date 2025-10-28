import { useState, useEffect } from "react";
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
import { Edit, Palette, FileText, LinkIcon, Image as ImageIcon, Check, AlertCircle } from "lucide-react";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  categoryNameAr,
}: EditCategoryDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nameAr: categoryNameAr,
    nameEn: categoryName,
    slug: "",
    bannerImage: "",
    color: "#3B82F6",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) {
      setFormData({
        nameAr: categoryNameAr,
        nameEn: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
        bannerImage: "",
        color: "#3B82F6",
      });
      setStep(1);
      setErrors({});
    }
  }, [categoryNameAr, categoryName, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          slug: data.slug,
          bannerImage: data.bannerImage,
          color: data.color,
        }),
      });
      if (!response.ok) throw new Error("Failed to update category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: language === "ar" ? "✓ تم التحديث" : "✓ Updated",
        description: language === "ar" ? "تم تحديث القسم بنجاح" : "Category updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تحديث القسم" : "Failed to update category",
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
    if (validateStep(3)) {
      updateMutation.mutate(formData);
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
      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg -mx-6 -mt-6 px-6 py-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-xl font-bold">
                {language === "ar" ? "تعديل القسم" : "Edit Category"}
              </DialogTitle>
              <p className="text-green-100 text-sm mt-1">
                {language === "ar" ? "تحديث بيانات القسم والإعدادات" : "Update category information and settings"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s === step
                    ? "bg-green-600 text-white scale-110"
                    : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
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
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "الاسم بالعربية" : "Arabic Name"}
                </Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => {
                    setFormData({ ...formData, nameAr: e.target.value });
                    setErrors({ ...errors, nameAr: "" });
                  }}
                  placeholder={language === "ar" ? "مثال: سياسة" : "e.g., Politics"}
                  className={`h-11 rounded-lg border-2 transition-all ${
                    errors.nameAr ? "border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.nameAr && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nameAr}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "الاسم بالإنجليزية" : "English Name"}
                </Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => {
                    setFormData({ ...formData, nameEn: e.target.value });
                    setErrors({ ...errors, nameEn: "" });
                  }}
                  placeholder={language === "ar" ? "مثال: Politics" : "e.g., Politics"}
                  className={`h-11 rounded-lg border-2 transition-all ${
                    errors.nameEn ? "border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.nameEn && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nameEn}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Slug and Media */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
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
                  className={`h-11 rounded-lg border-2 transition-all font-mono ${
                    errors.slug ? "border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.slug && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.slug}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {language === "ar" ? "سيتم استخدام هذا الرابط في عنوان URL" : "This will be used in the URL"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "رابط صورة البانر" : "Banner Image URL"}
                </Label>
                <Input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 rounded-lg border-2 border-gray-200 focus:border-green-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {language === "ar" ? "اختياري - صورة لتمثيل القسم" : "Optional - image to represent the category"}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Color and Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "لون القسم" : "Category Color"}
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-11 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <div
                    className="flex-1 h-11 rounded-lg border-2 border-gray-200 flex items-center px-4 font-mono text-sm"
                    style={{ backgroundColor: formData.color + "20", borderColor: formData.color }}
                  >
                    {formData.color}
                  </div>
                </div>
              </div>

              {/* Review */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 space-y-3 border border-green-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "مراجعة البيانات" : "Review Information"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === "ar" ? "الاسم بالعربية:" : "Arabic Name:"}</span>
                    <span className="font-bold text-gray-900">{formData.nameAr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === "ar" ? "الاسم بالإنجليزية:" : "English Name:"}</span>
                    <span className="font-bold text-gray-900">{formData.nameEn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === "ar" ? "الرابط:" : "Slug:"}</span>
                    <span className="font-mono text-gray-900">{formData.slug}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === "ar" ? "اللون:" : "Color:"}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="font-mono text-gray-900">{formData.color}</span>
                    </div>
                  </div>
                </div>
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

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
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
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {updateMutation.isPending
                  ? language === "ar"
                    ? "جاري التحديث..."
                    : "Updating..."
                  : language === "ar"
                  ? "✓ حفظ التعديلات"
                  : "✓ Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

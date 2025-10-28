import { useState, useRef, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Ad {
  id: string;
  name: string;
  placement: string;
  url?: string;
  filePath?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  budget?: number;
  targetPages?: string[];
}

interface CreateAdProfessionalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAd?: Ad | null;
}

export function CreateAdProfessional({ open, onOpenChange, editingAd }: CreateAdProfessionalProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    placement: "header",
    url: "",
    active: true,
    startDate: "",
    endDate: "",
    budget: 0,
    targetPages: ["all"] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // معالجة رفع الصور
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "الرجاء اختيار صورة" : "Please select an image",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 5MB" : "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(0);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setUploadProgress(100);
    };
    reader.readAsDataURL(file);
  };

  // معالجة Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  // تحميل بيانات الإعلان عند التعديل
  useEffect(() => {
    if (editingAd && open) {
      setFormData({
        name: editingAd.name || "",
        placement: editingAd.placement || "header",
        url: editingAd.url || "",
        active: editingAd.active ?? true,
        startDate: editingAd.startDate || "",
        endDate: editingAd.endDate || "",
        budget: editingAd.budget || 0,
        targetPages: editingAd.targetPages || ["all"],
      });
      if (editingAd.filePath) {
        setPreviewUrl(editingAd.filePath);
        setUploadProgress(100);
      }
    } else if (!open) {
      resetForm();
    }
  }, [editingAd, open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!previewUrl) {
        throw new Error(language === "ar" ? "الرجاء اختيار صورة" : "Please select an image");
      }

      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";

      console.log(`[${editingAd ? 'UpdateAd' : 'CreateAd'}] Sending data:`, { ...formData, filePath: previewUrl });
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          filePath: previewUrl,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingAd ? 'update' : 'create'} ad`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Success",
        description: editingAd
          ? (language === "ar" ? "تم تحديث الإعلان بنجاح" : "Ad updated successfully")
          : (language === "ar" ? "تم إنشاء الإعلان بنجاح" : "Ad created successfully"),
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error(`[${editingAd ? 'UpdateAd' : 'CreateAd'}] Error:`, error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل حفظ الإعلان" : "Failed to save ad"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      placement: "header",
      url: "",
      active: true,
      startDate: "",
      endDate: "",
      budget: 0,
      targetPages: ["all"],
    });
    setImageFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
  };

  const placementOptions = {
    header: { ar: "الرأس", en: "Header", size: "1200×90", icon: "📱" },
    "sidebar-top": { ar: "الشريط الجانبي (أعلى)", en: "Sidebar Top", size: "300×250", icon: "📊" },
    "sidebar-middle": { ar: "الشريط الجانبي (وسط)", en: "Sidebar Middle", size: "300×250", icon: "📊" },
    "in-article": { ar: "داخل المقال", en: "In Article", size: "600×300", icon: "📰" },
    footer: { ar: "التذييل", en: "Footer", size: "1200×90", icon: "📱" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingAd
              ? (language === "ar" ? "تعديل الإعلان" : "Edit Ad")
              : (language === "ar" ? "إنشاء إعلان جديد" : "Create New Ad")
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* رفع الصورة - القسم الأول والأهم */}
          <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                {language === "ar" ? "صورة الإعلان" : "Ad Image"} *
              </Label>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105" 
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                />

                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setPreviewUrl("");
                            setUploadProgress(0);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {language === "ar" ? "إزالة" : "Remove"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{language === "ar" ? "تم اختيار الصورة" : "Image selected"}</span>
                    </div>
                    {uploadProgress < 100 && (
                      <Progress value={uploadProgress} className="w-full" />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {language === "ar" ? "اسحب الصورة هنا" : "Drag image here"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {language === "ar" ? "أو انقر لاختيار ملف" : "or click to select file"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {language === "ar" ? "PNG, JPG, GIF حتى 5MB" : "PNG, JPG, GIF up to 5MB"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-3 text-center">
                {language === "ar"
                  ? `الحجم المطلوب: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`
                  : `Required size: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`}
              </p>
            </CardContent>
          </Card>

          {/* معلومات الإعلان */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* اسم الإعلان */}
                <div className="md:col-span-2">
                  <Label className="text-base font-semibold">{language === "ar" ? "اسم الإعلان" : "Ad Name"} *</Label>
                  <Input
                    placeholder={language === "ar" ? "أدخل اسم الإعلان" : "Enter ad name"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* الموقع */}
                <div>
                  <Label className="text-base font-semibold">{language === "ar" ? "الموقع" : "Placement"} *</Label>
                  <Select value={formData.placement} onValueChange={(value) => setFormData({ ...formData, placement: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(placementOptions).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span>{value.icon}</span>
                            <span>{language === "ar" ? value.ar : value.en}</span>
                            <span className="text-xs text-muted-foreground">({value.size})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* رابط الإعلان */}
                <div>
                  <Label className="text-base font-semibold">{language === "ar" ? "رابط الإعلان" : "Ad URL"}</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* التواريخ */}
                <div>
                  <Label className="text-base font-semibold">{language === "ar" ? "تاريخ البداية" : "Start Date"}</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">{language === "ar" ? "تاريخ النهاية" : "End Date"}</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* الميزانية */}
                <div>
                  <Label className="text-base font-semibold">{language === "ar" ? "الميزانية" : "Budget"}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>

                {/* الصفحات المستهدفة */}
                <div className="md:col-span-2">
                  <Label className="text-base font-semibold mb-3 block">
                    {language === "ar" ? "الصفحات المستهدفة" : "Target Pages"}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: "all", label: language === "ar" ? "جميع الصفحات" : "All Pages", icon: "🌐" },
                      { value: "home", label: language === "ar" ? "الرئيسية" : "Home", icon: "🏠" },
                      { value: "articles", label: language === "ar" ? "المقالات" : "Articles", icon: "📰" },
                      { value: "categories", label: language === "ar" ? "الأقسام" : "Categories", icon: "📁" },
                      { value: "article", label: language === "ar" ? "صفحة المقال" : "Article Page", icon: "📄" },
                      { value: "about", label: language === "ar" ? "من نحن" : "About", icon: "ℹ️" },
                    ].map((page) => (
                      <label
                        key={page.value}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.targetPages.includes(page.value)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetPages.includes(page.value)}
                          onChange={(e) => {
                            if (page.value === "all") {
                              setFormData({ ...formData, targetPages: e.target.checked ? ["all"] : [] });
                            } else {
                              const newPages = e.target.checked
                                ? [...formData.targetPages.filter(p => p !== "all"), page.value]
                                : formData.targetPages.filter((p) => p !== page.value);
                              setFormData({ ...formData, targetPages: newPages.length > 0 ? newPages : ["all"] });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-lg">{page.icon}</span>
                        <span className="text-sm font-medium">{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* نشط */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Label className="text-base font-semibold">{language === "ar" ? "نشط" : "Active"}</Label>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأزرار */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} size="lg">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!formData.name || !previewUrl || createMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {editingAd
                    ? (language === "ar" ? "تحديث الإعلان" : "Update Ad")
                    : (language === "ar" ? "حفظ الإعلان" : "Save Ad")
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

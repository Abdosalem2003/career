import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdDialogV3({ open, onOpenChange }: CreateAdDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    placement: "header",
    url: "",
    active: true,
    startDate: "",
    endDate: "",
    budget: 0,
    spent: 0,
    conversions: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile) {
        throw new Error(language === "ar" ? "الرجاء اختيار صورة" : "Please select an image");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("placement", formData.placement);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("active", String(formData.active));
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("budget", String(formData.budget));
      formDataToSend.append("spent", String(formData.spent));
      formDataToSend.append("conversions", String(formData.conversions));
      formDataToSend.append("image", imageFile);

      setUploading(true);
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        body: formDataToSend,
      });
      setUploading(false);

      if (!response.ok) throw new Error("Failed to create ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Success",
        description: language === "ar" ? "تم إنشاء الإعلان بنجاح" : "Ad created successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل إنشاء الإعلان" : "Failed to create ad"),
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
      spent: 0,
      conversions: 0,
    });
    setImageFile(null);
    setPreviewUrl("");
  };

  const placementOptions = {
    header: { ar: "الرأس", en: "Header", size: "1200×90" },
    "sidebar-top": { ar: "الشريط الجانبي (أعلى)", en: "Sidebar Top", size: "300×250" },
    "sidebar-middle": { ar: "الشريط الجانبي (وسط)", en: "Sidebar Middle", size: "300×250" },
    "in-article": { ar: "داخل المقال", en: "In Article", size: "600×300" },
    footer: { ar: "التذييل", en: "Footer", size: "1200×90" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{language === "ar" ? "إنشاء إعلان جديد" : "Create New Ad"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">{language === "ar" ? "الأساسي" : "Basic"}</TabsTrigger>
            <TabsTrigger value="image">{language === "ar" ? "الصورة" : "Image"}</TabsTrigger>
          </TabsList>

          {/* Tab 1: البيانات الأساسية */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>{language === "ar" ? "اسم الإعلان" : "Ad Name"}</Label>
              <Input
                placeholder={language === "ar" ? "أدخل اسم الإعلان" : "Enter ad name"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>{language === "ar" ? "الموقع" : "Placement"}</Label>
              <Select value={formData.placement} onValueChange={(value) => setFormData({ ...formData, placement: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(placementOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {language === "ar" ? value.ar : value.en} ({value.size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === "ar" ? "رابط الإعلان" : "Ad URL"}</Label>
              <Input
                type="url"
                placeholder={language === "ar" ? "https://example.com" : "https://example.com"}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === "ar" ? "الميزانية" : "Budget"}</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{language === "ar" ? "تاريخ البداية" : "Start Date"}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{language === "ar" ? "نشط" : "Active"}</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </TabsContent>

          {/* Tab 2: رفع الصورة */}
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label>{language === "ar" ? "صورة الإعلان" : "Ad Image"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === "ar"
                  ? `الحجم المطلوب: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`
                  : `Required size: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`}
              </p>
            </div>

            {/* منطقة Drag & Drop */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300"
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
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-cover"
                  />
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{language === "ar" ? "تم اختيار الصورة" : "Image selected"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="font-medium">{language === "ar" ? "اسحب الصورة هنا" : "Drag image here"}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "أو انقر لاختيار ملف" : "or click to select file"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {previewUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl("");
                }}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                {language === "ar" ? "إزالة الصورة" : "Remove Image"}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!formData.name || !imageFile || createMutation.isPending || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading || createMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {language === "ar" ? "جاري الرفع..." : "Uploading..."}
              </>
            ) : (
              language === "ar" ? "حفظ الإعلان" : "Save Ad"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdSimple({ open, onOpenChange }: CreateAdDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    placement: "header",
    url: "",
    filePath: "",
    active: true,
    startDate: "",
    endDate: "",
    budget: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("[CreateAd] Sending data:", data);
      
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create ad");
      }
      
      const result = await response.json();
      console.log("[CreateAd] Ad created:", result);
      return result;
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
      console.error("[CreateAd] Error:", error);
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
      filePath: "",
      active: true,
      startDate: "",
      endDate: "",
      budget: 0,
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{language === "ar" ? "إنشاء إعلان جديد" : "Create New Ad"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* اسم الإعلان */}
          <div>
            <Label>{language === "ar" ? "اسم الإعلان" : "Ad Name"} *</Label>
            <Input
              placeholder={language === "ar" ? "أدخل اسم الإعلان" : "Enter ad name"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* الموقع */}
          <div>
            <Label>{language === "ar" ? "الموقع" : "Placement"} *</Label>
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

          {/* رابط الصورة */}
          <div>
            <Label>{language === "ar" ? "رابط الصورة" : "Image URL"} *</Label>
            <Input
              type="url"
              placeholder={language === "ar" ? "https://example.com/image.jpg" : "https://example.com/image.jpg"}
              value={formData.filePath}
              onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" 
                ? `الحجم المطلوب: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`
                : `Required size: ${placementOptions[formData.placement as keyof typeof placementOptions]?.size}`}
            </p>
          </div>

          {/* معاينة الصورة */}
          {formData.filePath && (
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">{language === "ar" ? "معاينة" : "Preview"}</Label>
              <img
                src={formData.filePath}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23ddd' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' dy='.3em'%3EInvalid Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          )}

          {/* رابط الإعلان */}
          <div>
            <Label>{language === "ar" ? "رابط الإعلان" : "Ad URL"}</Label>
            <Input
              type="url"
              placeholder={language === "ar" ? "https://example.com" : "https://example.com"}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          {/* التواريخ والميزانية */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{language === "ar" ? "تاريخ البداية" : "Start Date"}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === "ar" ? "تاريخ النهاية" : "End Date"}</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>{language === "ar" ? "الميزانية" : "Budget"}</Label>
            <Input
              type="number"
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            />
          </div>

          {/* نشط */}
          <div className="flex items-center justify-between">
            <Label>{language === "ar" ? "نشط" : "Active"}</Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.name || !formData.filePath || createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {language === "ar" ? "جاري الحفظ..." : "Saving..."}
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

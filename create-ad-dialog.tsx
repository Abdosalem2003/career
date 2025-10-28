
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

export function CreateAdDialog({ open, onOpenChange }: CreateAdDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    placement: "header",
    filePath: "",
    url: "",
    active: true,
    startDate: "",
    endDate: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      setFormData({ name: "", placement: "header", filePath: "", url: "", active: true, startDate: "", endDate: "" });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء الإعلان" : "Failed to create ad",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "إنشاء إعلان جديد" : "Create New Ad"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "ar" ? "اسم الإعلان" : "Ad Name"}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "الموقع" : "Placement"}</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) => setFormData({ ...formData, placement: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">{language === "ar" ? "الرأس" : "Header"}</SelectItem>
                <SelectItem value="sidebar-top">{language === "ar" ? "الشريط الجانبي (أعلى)" : "Sidebar Top"}</SelectItem>
                <SelectItem value="sidebar-middle">{language === "ar" ? "الشريط الجانبي (وسط)" : "Sidebar Middle"}</SelectItem>
                <SelectItem value="in-article">{language === "ar" ? "داخل المقال" : "In Article"}</SelectItem>
                <SelectItem value="footer">{language === "ar" ? "التذييل" : "Footer"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "رابط الصورة" : "Image URL"}</Label>
            <Input
              type="url"
              value={formData.filePath}
              onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "رابط الإعلان" : "Ad URL"}</Label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === "ar" ? "تاريخ البداية" : "Start Date"}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === "ar" ? "تاريخ النهاية" : "End Date"}</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                : language === "ar" ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

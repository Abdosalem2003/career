
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
import { useToast } from "@/hooks/use-toast";

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadMediaDialog({ open, onOpenChange }: UploadMediaDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fileName: "",
    filePath: "",
    mimeType: "image/jpeg",
    size: 0,
    uploadedBy: "admin-id",
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to upload media");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({
        title: language === "ar" ? "تم الرفع" : "Success",
        description: language === "ar" ? "تم رفع الملف بنجاح" : "File uploaded successfully",
      });
      onOpenChange(false);
      setFormData({ fileName: "", filePath: "", mimeType: "image/jpeg", size: 0, uploadedBy: "admin-id" });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل رفع الملف" : "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "رفع ملف جديد" : "Upload New File"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "ar" ? "اسم الملف" : "File Name"}</Label>
            <Input
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "رابط الملف" : "File URL"}</Label>
            <Input
              type="url"
              value={formData.filePath}
              onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "نوع الملف" : "MIME Type"}</Label>
            <Input
              value={formData.mimeType}
              onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
              placeholder="image/jpeg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "الحجم (بايت)" : "Size (bytes)"}</Label>
            <Input
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending
                ? language === "ar" ? "جاري الرفع..." : "Uploading..."
                : language === "ar" ? "رفع" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

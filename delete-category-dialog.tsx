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
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  categoryNameAr,
}: DeleteCategoryDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: language === "ar" ? "✓ تم الحذف" : "✓ Deleted",
        description: language === "ar" ? "تم حذف القسم بنجاح" : "Category deleted successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل حذف القسم" : "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg -mx-6 -mt-6 px-6 py-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold">
                {language === "ar" ? "حذف القسم" : "Delete Category"}
              </DialogTitle>
              <p className="text-red-100 text-sm mt-1">
                {language === "ar" ? "هذا الإجراء لا يمكن التراجع عنه" : "This action cannot be undone"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {language === "ar" 
                ? `هل أنت متأكد من رغبتك في حذف القسم "${categoryNameAr}" (${categoryName})؟`
                : `Are you sure you want to delete the category "${categoryName}"?`
              }
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800 font-semibold mb-2">
              {language === "ar" ? "⚠️ تحذير:" : "⚠️ Warning:"}
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• {language === "ar" ? "سيتم حذف القسم نهائياً" : "The category will be permanently deleted"}</li>
              <li>• {language === "ar" ? "لا يمكن استرجاع البيانات بعد الحذف" : "Data cannot be recovered after deletion"}</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              {deleteMutation.isPending
                ? language === "ar"
                  ? "جاري الحذف..."
                  : "Deleting..."
                : language === "ar"
                ? "✓ حذف نهائي"
                : "✓ Delete Permanently"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

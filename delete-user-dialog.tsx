// نموذج حذف المستخدم
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ user, open, onClose, onSuccess }: DeleteUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل حذف المستخدم");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      onSuccess?.();
      onClose();
      setConfirmText("");
    },
    onError: () => {
      toast({
        title: "❌ خطأ",
        description: "فشل حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  const canDelete = confirmText === user.email;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setConfirmText("");
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <span>حذف المستخدم</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم نهائياً.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h4 className="font-bold text-red-900 text-lg">تحذير: عملية حذف نهائية</h4>
                <p className="text-red-800">
                  أنت على وشك حذف المستخدم <strong>{user.name}</strong> ({user.email})
                </p>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>سيتم حذف جميع المقالات والمحتوى المرتبط بهذا المستخدم</li>
                  <li>سيتم حذف سجل النشاطات والتعليقات</li>
                  <li>لا يمكن استرجاع البيانات بعد الحذف</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmEmail" className="text-base font-bold">
              للتأكيد، اكتب البريد الإلكتروني للمستخدم: <span className="text-red-600">{user.email}</span>
            </Label>
            <Input
              id="confirmEmail"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="أدخل البريد الإلكتروني للتأكيد"
              className="text-lg"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            onClick={() => deleteUserMutation.mutate()}
            disabled={!canDelete || deleteUserMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteUserMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmText("");
              onClose();
            }}
            className="flex-1"
            disabled={deleteUserMutation.isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { useToast } from "@/hooks/use-toast";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "viewer",
    jobTitle: "",
    department: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Success",
        description: language === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully",
      });
      onOpenChange(false);
      setFormData({ email: "", password: "", name: "", role: "viewer", jobTitle: "", department: "" });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء المستخدم" : "Failed to create user",
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
            {language === "ar" ? "إنشاء مستخدم جديد" : "Create New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "ar" ? "الاسم" : "Name"}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "كلمة المرور" : "Password"}</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "الدور" : "Role"}</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">{language === "ar" ? "مدير عام" : "Super Admin"}</SelectItem>
                <SelectItem value="admin">{language === "ar" ? "مدير" : "Admin"}</SelectItem>
                <SelectItem value="editor">{language === "ar" ? "محرر" : "Editor"}</SelectItem>
                <SelectItem value="author">{language === "ar" ? "كاتب" : "Author"}</SelectItem>
                <SelectItem value="moderator">{language === "ar" ? "مشرف" : "Moderator"}</SelectItem>
                <SelectItem value="viewer">{language === "ar" ? "مشاهد" : "Viewer"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "المسمى الوظيفي" : "Job Title"}</Label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "ar" ? "القسم" : "Department"}</Label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

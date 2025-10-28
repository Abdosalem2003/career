// نموذج عرض الصلاحيات
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Role, RoleLabels, PermissionLabels, RolePermissions } from "@shared/permissions";

interface User {
  id: string;
  name: string;
  role: Role;
}

interface PermissionsDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function PermissionsDialog({ user, open, onClose }: PermissionsDialogProps) {
  const permissions = RolePermissions[user.role] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span>صلاحيات {user.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            الدور: <strong>{RoleLabels[user.role].ar}</strong> • عدد الصلاحيات: <strong>{permissions.length}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissions.map((permission) => (
              <div
                key={permission}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-md transition-all"
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">
                    {PermissionLabels[permission].ar}
                  </div>
                  <div className="text-xs text-gray-600">
                    {PermissionLabels[permission].en}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {permissions.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد صلاحيات لهذا المستخدم</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

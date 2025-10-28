/**
 * User Form Dialog with Profile Image & Social Links
 * نموذج المستخدم مع صورة البروفايل والروابط الاجتماعية
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, Phone, Lock, Upload, X, Save,
  Twitter, Facebook, Instagram, Linkedin, Globe
} from "lucide-react";
import { Role, RoleLabels } from "@shared/permissions";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function UserFormDialog({ open, onClose, user, onSubmit, isLoading }: UserFormDialogProps) {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.VIEWER,
    phone: "",
    jobTitle: "",
    bio: "",
    socialLinks: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      website: ""
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || Role.VIEWER,
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
        bio: user.bio || "",
        socialLinks: user.socialLinks || {
          twitter: "", facebook: "", instagram: "", linkedin: "", website: ""
        }
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "⚠️ حجم الصورة كبير",
        description: "الحد الأقصى 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "⚠️ خطأ",
        description: "الرجاء ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!user && !formData.password) {
      toast({
        title: "⚠️ خطأ",
        description: "الرجاء إدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...formData,
      profileImage,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Image */}
          <Card className="p-4">
            <Label className="text-sm font-medium mb-3 block">صورة البروفايل</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.name[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الحد الأقصى: 2MB | JPG, PNG, GIF
                </p>
                {profileImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfileImage(null)}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    إزالة الصورة
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">الاسم *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="الاسم الكامل"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">البريد الإلكتروني *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">كلمة المرور {!user && "*"}</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={user ? "اتركه فارغاً للإبقاء على القديمة" : "كلمة المرور"}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">رقم الهاتف</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 123 456 7890"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">الدور الوظيفي</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as Role })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RoleLabels).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {typeof label === 'string' ? label : label.ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">المسمى الوظيفي</Label>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="محرر، كاتب، صحفي..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">نبذة تعريفية</Label>
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="نبذة مختصرة عن الكاتب..."
                className="mt-1"
              />
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-medium">الروابط الاجتماعية</Label>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Twitter</Label>
                <div className="relative mt-1">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Facebook</Label>
                <div className="relative mt-1">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                  <Input
                    value={formData.socialLinks.facebook}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Instagram</Label>
                <div className="relative mt-1">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600" />
                  <Input
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">LinkedIn</Label>
                <div className="relative mt-1">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-700" />
                  <Input
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm text-gray-600">الموقع الشخصي</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    value={formData.socialLinks.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, website: e.target.value }
                    })}
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "جاري الحفظ..." : (user ? "تحديث" : "إضافة")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

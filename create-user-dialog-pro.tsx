// نموذج إنشاء مستخدم احترافي
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Eye,
  EyeOff,
  Upload,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Shield,
} from "lucide-react";
import { Role, RoleLabels, PermissionLabels, RolePermissions } from "@shared/permissions";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserDialogPro({ open, onClose, onSuccess }: CreateUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.VIEWER as Role,
    phone: "",
    bio: "",
    status: "active" as "active" | "inactive" | "suspended",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const dataToSend: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
        phone: data.phone || '',
        bio: data.bio || '',
      };
      
      // Convert image to base64 if selected
      if (imageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        dataToSend.profileImage = base64;
      }
      
      // Handle socialLinks - clean empty values
      const cleanSocialLinks: any = {};
      if (data.socialLinks) {
        Object.keys(data.socialLinks).forEach(key => {
          if (data.socialLinks[key] && data.socialLinks[key].trim() !== '') {
            cleanSocialLinks[key] = data.socialLinks[key].trim();
          }
        });
      }
      if (Object.keys(cleanSocialLinks).length > 0) {
        dataToSend.socialLinks = cleanSocialLinks;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل إنشاء المستخدم");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ تم الإنشاء",
        description: "تم إنشاء المستخدم بنجاح",
      });
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: Role.VIEWER,
      phone: "",
      bio: "",
      status: "active",
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        website: "",
      },
    });
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <span>إنشاء مستخدم جديد</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            أدخل بيانات المستخدم الجديد وحدد دوره وصلاحياته بدقة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt="Preview" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
                  {formData.name.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="createProfileImage" className="cursor-pointer">
                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                  <Upload className="h-5 w-5" />
                  <span className="font-bold">رفع صورة البروفايل</span>
                </div>
              </Label>
              <Input
                id="createProfileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-gray-600">PNG, JPG, GIF حتى 5MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createName">الاسم الكامل *</Label>
              <Input
                id="createName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أحمد محمد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createEmail">البريد الإلكتروني *</Label>
              <Input
                id="createEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createPassword">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  id="createPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="createPhone">رقم الهاتف</Label>
              <Input
                id="createPhone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966 50 123 4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="createBio">نبذة تعريفية</Label>
            <Textarea
              id="createBio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="نبذة مختصرة عن المستخدم..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createRole">الدور *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <span>{RoleLabels[role].icon}</span>
                        <span>{RoleLabels[role].ar}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="createStatus">الحالة *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              روابط السوشيال ميديا
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createFacebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  فيسبوك
                </Label>
                <Input
                  id="createFacebook"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createTwitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  تويتر / X
                </Label>
                <Input
                  id="createTwitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createInstagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  إنستغرام
                </Label>
                <Input
                  id="createInstagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createLinkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  لينكد إن
                </Label>
                <Input
                  id="createLinkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createYoutube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  يوتيوب
                </Label>
                <Input
                  id="createYoutube"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                  placeholder="https://youtube.com/@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createWebsite" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  الموقع الشخصي
                </Label>
                <Input
                  id="createWebsite"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, website: e.target.value }
                  })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Permissions Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الصلاحيات المتاحة لهذا الدور ({RolePermissions[formData.role].length} صلاحية)
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {RolePermissions[formData.role].slice(0, 10).map((permission) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {PermissionLabels[permission].ar}
                </Badge>
              ))}
              {RolePermissions[formData.role].length > 10 && (
                <Badge variant="secondary" className="text-xs">
                  +{RolePermissions[formData.role].length - 10} المزيد
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {createUserMutation.isPending ? "جاري الإنشاء..." : "إنشاء المستخدم"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="flex-1"
            disabled={createUserMutation.isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

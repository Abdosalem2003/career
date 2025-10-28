// نموذج تعديل المستخدم الاحترافي
import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Eye,
  EyeOff,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react";
import { Role, RoleLabels } from "@shared/permissions";
import { ProfileImageUploader } from "./profile-image-uploader";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profileImage?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUserDialog({ user, open, onClose, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  
  // Use ref to store the current profile image
  const currentProfileImageRef = useRef<string>(user.profileImage || "");

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    role: user.role,
    phone: user.phone || "",
    bio: user.bio || "",
    status: user.status,
    profileImage: user.profileImage || "",
    socialLinks: {
      facebook: user.socialLinks?.facebook || "",
      twitter: user.socialLinks?.twitter || "",
      instagram: user.socialLinks?.instagram || "",
      linkedin: user.socialLinks?.linkedin || "",
      youtube: user.socialLinks?.youtube || "",
      website: user.socialLinks?.website || "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const dataToSend: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        phone: data.phone || '',
        bio: data.bio || '',
        jobTitle: data.jobTitle || '',
        department: data.department || '',
      };
      
      // Only include password if changed
      if (data.password && data.password.trim() !== '') {
        dataToSend.password = data.password;
      }
      
      // Handle profile image - use ref as fallback
      const profileImageToSend = currentProfileImageRef.current || data.profileImage;
      console.log('[EditUserDialog] Profile image to send - from ref:', currentProfileImageRef.current?.length || 0, 'from data:', data.profileImage?.length || 0);
      
      if (profileImageToSend) {
        dataToSend.profileImage = profileImageToSend;
        console.log('[EditUserDialog] Including profileImage in request, length:', profileImageToSend.length);
      } else {
        console.log('[EditUserDialog] No profileImage to send');
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

      console.log('Sending update data:', dataToSend);

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || "فشل تحديث المستخدم");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
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

  const handleImageChange = (base64: string) => {
    console.log('[EditUserDialog] Image changed, base64 length:', base64.length);
    console.log('[EditUserDialog] Base64 preview:', base64.substring(0, 100));
    
    // Store in ref immediately
    currentProfileImageRef.current = base64;
    console.log('[EditUserDialog] Stored in ref, length:', currentProfileImageRef.current.length);
    
    // Also update formData
    setFormData((prev) => {
      const updated = { 
        ...prev, 
        profileImage: base64 
      };
      console.log('[EditUserDialog] Updated formData.profileImage length:', updated.profileImage?.length || 0);
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <span>تعديل بيانات المستخدم</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            تحديث معلومات {user.name} وإعداداته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Image Upload - New Simple Component */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <ProfileImageUploader
              currentImage={formData.profileImage}
              userName={user.name}
              onImageChange={handleImageChange}
              size="lg"
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أحمد محمد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة (اتركها فارغة)</Label>
              <div className="relative">
                <Input
                  id="password"
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

            {user.email !== 'superadmin@careercanvas.com' && (
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 123 4567"
                />
              </div>
            )}
          </div>

          {user.email !== 'superadmin@careercanvas.com' && (
            <div className="space-y-2">
              <Label htmlFor="bio">نبذة تعريفية</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="نبذة مختصرة عن المستخدم..."
                rows={3}
              />
            </div>
          )}

          {/* Hide role and status for super admin */}
          {user.email !== 'superadmin@careercanvas.com' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">الدور *</Label>
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
                <Label htmlFor="status">الحالة *</Label>
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
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="font-semibold">حساب المدير العام الدائم</p>
                  <p className="text-sm">الدور والحالة محميان ولا يمكن تغييرهما. يمكنك فقط تعديل البريد الإلكتروني وكلمة المرور.</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Links - Hide for super admin */}
          {user.email !== 'superadmin@careercanvas.com' && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                روابط السوشيال ميديا
              </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  فيسبوك
                </Label>
                <Input
                  id="facebook"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  تويتر / X
                </Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  إنستغرام
                </Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  لينكد إن
                </Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  يوتيوب
                </Label>
                <Input
                  id="youtube"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                  placeholder="https://youtube.com/@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  الموقع الشخصي
                </Label>
                <Input
                  id="website"
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
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            onClick={() => {
              console.log('[EditUserDialog] Saving, profileImage:', formData.profileImage ? `${formData.profileImage.substring(0, 50)}...` : 'Empty');
              updateUserMutation.mutate(formData);
            }}
            disabled={updateUserMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {updateUserMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={updateUserMutation.isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Mail, User, Eye, EyeOff, Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

export default function SuperAdminSettings() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    jobTitle: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load current admin data
  const { data: adminData, isLoading, error } = useQuery<{
    username: string;
    email: string;
    jobTitle?: string;
  }>({
    queryKey: ["/api/admin/super-admin/profile"],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (adminData) {
      setFormData(prev => ({
        ...prev,
        username: adminData.username || "",
        email: adminData.email || "",
        jobTitle: adminData.jobTitle || "",
      }));
    }
  }, [adminData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/admin/super-admin/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم التحديث بنجاح" : "Updated Successfully",
        description: language === "ar" 
          ? "تم تحديث بياناتك بنجاح" 
          : "Your profile has been updated successfully",
      });
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "فشل التحديث" : "Update failed"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" 
          ? "يرجى ملء جميع الحقول المطلوبة" 
          : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Password validation if changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" 
            ? "يرجى إدخال كلمة المرور الحالية" 
            : "Please enter current password",
          variant: "destructive",
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" 
            ? "كلمات المرور الجديدة غير متطابقة" 
            : "New passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (formData.newPassword.length < 8) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" 
            ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" 
            : "Password must be at least 8 characters",
          variant: "destructive",
        });
        return;
      }
    }

    // Submit data
    const dataToSubmit: any = {
      username: formData.username,
      email: formData.email,
      jobTitle: formData.jobTitle,
    };

    if (formData.newPassword) {
      dataToSubmit.currentPassword = formData.currentPassword;
      dataToSubmit.newPassword = formData.newPassword;
    }

    updateProfileMutation.mutate(dataToSubmit);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {language === "ar" 
              ? "حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة أو المحاولة لاحقاً." 
              : "An error occurred while loading data. Please refresh the page or try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "إعدادات المدير العام" : "Super Admin Settings"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" 
              ? "صفحة محمية - أعلى صلاحيات في النظام" 
              : "Protected Page - Highest System Privileges"}
          </p>
        </div>
      </div>

      {/* Security Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          {language === "ar" 
            ? "⚠️ هذه الصفحة محمية ومخصصة للمدير العام فقط. جميع التغييرات يتم تسجيلها في سجل النظام." 
            : "⚠️ This page is protected and exclusive to the Super Admin. All changes are logged in the system audit trail."}
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {language === "ar" ? "المعلومات الشخصية" : "Profile Information"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "قم بتحديث اسم المستخدم والبريد الإلكتروني الخاص بك" 
                : "Update your username and email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {language === "ar" ? "اسم المستخدم" : "Username"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={language === "ar" ? "أدخل اسم المستخدم" : "Enter username"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={language === "ar" ? "أدخل البريد الإلكتروني" : "Enter email"}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                {language === "ar" ? "المسمى الوظيفي" : "Job Title"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder={language === "ar" ? "مثال: المدير التنفيذي" : "e.g., Chief Executive Officer"}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور" 
                : "Leave fields empty if you don't want to change password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder={language === "ar" ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder={language === "ar" ? "8 أحرف على الأقل" : "At least 8 characters"}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={language === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {updateProfileMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {language === "ar" ? "جاري الحفظ..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

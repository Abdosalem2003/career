import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Mail, Zap, Bell, Database, Upload, Share2, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@shared/types";

export default function AdminSettings() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const { data: settings = {} as SiteSettings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData(settings);
      // Set preview to the actual URL from settings
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
      if (settings.favicon) {
        setFaviconPreview(settings.favicon);
      }
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh all components
      queryClient.invalidateQueries();
      
      toast({
        title: language === "ar" ? "تم الحفظ" : "Success",
        description: language === "ar" ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        try {
          // Upload to server
          const response = await fetch("/api/admin/settings/upload-logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64 }),
          });
          
          if (!response.ok) throw new Error("Upload failed");
          
          const data = await response.json();
          
          // Update preview with the server URL
          setLogoPreview(data.url);
          
          // Update form data
          const updatedFormData = { ...formData, logo: data.url };
          setFormData(updatedFormData);
          
          // Save to settings immediately
          await saveMutation.mutateAsync(updatedFormData);
          
          // Invalidate queries to refresh
          queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
          
          toast({
            title: language === "ar" ? "تم الرفع" : "Uploaded",
            description: language === "ar" ? "تم رفع الشعار بنجاح" : "Logo uploaded successfully",
          });
        } catch (error) {
          toast({
            title: language === "ar" ? "خطأ" : "Error",
            description: language === "ar" ? "فشل رفع الشعار" : "Failed to upload logo",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        try {
          // Upload to server
          const response = await fetch("/api/admin/settings/upload-favicon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64 }),
          });
          
          if (!response.ok) throw new Error("Upload failed");
          
          const data = await response.json();
          
          // Update preview with the server URL
          setFaviconPreview(data.url);
          
          // Update form data
          const updatedFormData = { ...formData, favicon: data.url };
          setFormData(updatedFormData);
          
          // Save to settings immediately
          await saveMutation.mutateAsync(updatedFormData);
          
          // Invalidate queries to refresh
          queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
          
          toast({
            title: language === "ar" ? "تم الرفع" : "Uploaded",
            description: language === "ar" ? "تم رفع الأيقونة بنجاح" : "Favicon uploaded successfully",
          });
        } catch (error) {
          toast({
            title: language === "ar" ? "خطأ" : "Error",
            description: language === "ar" ? "فشل رفع الأيقونة" : "Failed to upload favicon",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar" ? "إدارة إعدادات الموقع والنظام" : "Manage site and system settings"}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-7">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            {language === "ar" ? "عام" : "General"}
          </TabsTrigger>
          <TabsTrigger value="footer">
            <FileText className="h-4 w-4 mr-2" />
            {language === "ar" ? "الفوتر" : "Footer"}
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            {language === "ar" ? "سوشيال" : "Social"}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            {language === "ar" ? "البريد" : "Email"}
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            {language === "ar" ? "الأداء" : "Performance"}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {language === "ar" ? "الإشعارات" : "Notifications"}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Database className="h-4 w-4 mr-2" />
            {language === "ar" ? "متقدم" : "Advanced"}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "معلومات الموقع" : "Site Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "اسم الموقع (عربي)" : "Site Name (Arabic)"}</Label>
                  <Input
                    value={formData.siteNameAr || ""}
                    onChange={(e) => setFormData({ ...formData, siteNameAr: e.target.value })}
                    placeholder={language === "ar" ? "أخبار اليوم" : "Today's News"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "ar" ? "اسم الموقع (إنجليزي)" : "Site Name (English)"}</Label>
                  <Input
                    value={formData.siteNameEn || ""}
                    onChange={(e) => setFormData({ ...formData, siteNameEn: e.target.value })}
                    placeholder="News Today"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "شعار الموقع" : "Site Logo"}</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "اسحب الشعار هنا أو انقر للاختيار" : "Drag logo here or click to select"}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "ar" ? "أيقونة الموقع (Favicon)" : "Site Favicon"}</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "اسحب الأيقونة هنا أو انقر للاختيار" : "Drag favicon here or click to select"}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "نبذة الموقع (عربي)" : "Site Subtitle (Arabic)"}</Label>
                  <Input
                    value={formData.siteDescriptionAr || ""}
                    onChange={(e) => setFormData({ ...formData, siteDescriptionAr: e.target.value })}
                    placeholder={language === "ar" ? "أخبار الأمم المتحدة اليوم" : "United Nations News Today"}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "النبذة التي تظهر أسفل اسم الموقع في الهيدر" : "Subtitle shown below site name in header"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{language === "ar" ? "نبذة الموقع (إنجليزي)" : "Site Subtitle (English)"}</Label>
                  <Input
                    value={formData.siteDescriptionEn || ""}
                    onChange={(e) => setFormData({ ...formData, siteDescriptionEn: e.target.value })}
                    placeholder="United Nations News Today"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "النبذة التي تظهر أسفل اسم الموقع في الهيدر" : "Subtitle shown below site name in header"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "البريد الإلكتروني" : "Contact Email"}</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "ar" ? "رقم الهاتف" : "Phone Number"}</Label>
                  <Input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 xx xxx xxxx"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{language === "ar" ? "وصف الموقع (للفوتر)" : "Site Description (For Footer)"}</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === "ar" ? "منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية على مدار الساعة" : "Professional news platform providing latest news and exclusive reports 24/7"}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "الوصف الطويل الذي يظهر في الفوتر" : "Long description shown in footer"}
                </p>
              </div>
              
              <Separator />
              
              {/* Management Team */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === "ar" ? "فريق الإدارة" : "Management Team"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "رئيس مجلس الإدارة" : "Chairman"}</Label>
                    <Input
                      value={formData.chairmanName || ""}
                      onChange={(e) => setFormData({ ...formData, chairmanName: e.target.value })}
                      placeholder={language === "ar" ? "د. محمد أحمد" : "Dr. Mohammed Ahmed"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "لقب رئيس مجلس الإدارة" : "Chairman Title"}</Label>
                    <Input
                      value={formData.chairmanTitle || ""}
                      onChange={(e) => setFormData({ ...formData, chairmanTitle: e.target.value })}
                      placeholder={language === "ar" ? "رئيس مجلس الإدارة" : "Chairman"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "رئيس التحرير" : "Editor in Chief"}</Label>
                    <Input
                      value={formData.editorInChiefName || ""}
                      onChange={(e) => setFormData({ ...formData, editorInChiefName: e.target.value })}
                      placeholder={language === "ar" ? "أ. عبدالرحمن سالم" : "Mr. Abdulrahman Salem"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "لقب رئيس التحرير" : "Editor in Chief Title"}</Label>
                    <Input
                      value={formData.editorInChiefTitle || ""}
                      onChange={(e) => setFormData({ ...formData, editorInChiefTitle: e.target.value })}
                      placeholder={language === "ar" ? "رئيس التحرير" : "Editor in Chief"}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{language === "ar" ? "وضع الصيانة" : "Maintenance Mode"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "تعطيل الموقع مؤقتاً للصيانة" : "Temporarily disable site for maintenance"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                  />
                </div>
                {formData.maintenanceMode && (
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "رسالة وضع الصيانة" : "Maintenance Message"}</Label>
                    <Textarea
                      value={formData.maintenanceMessage || ""}
                      onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                      placeholder={language === "ar" ? "الموقع تحت الصيانة حالياً. سنعود قريباً." : "Site is under maintenance. We'll be back soon."}
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "إعدادات الفوتر" : "Footer Settings"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "ar" 
                  ? "تخصيص النصوص والمعلومات التي تظهر في أسفل الموقع"
                  : "Customize texts and information displayed at the bottom of the site"
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Copyright Text */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "نص حقوق النشر" : "Copyright Text"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "نص حقوق النشر (عربي)" : "Copyright Text (Arabic)"}</Label>
                    <Input
                      value={formData.copyrightTextAr || ""}
                      onChange={(e) => setFormData({ ...formData, copyrightTextAr: e.target.value })}
                      placeholder="© 2025 أخبار اليوم. جميع الحقوق محفوظة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "نص حقوق النشر (إنجليزي)" : "Copyright Text (English)"}</Label>
                    <Input
                      value={formData.copyrightTextEn || ""}
                      onChange={(e) => setFormData({ ...formData, copyrightTextEn: e.target.value })}
                      placeholder="© 2025 Today's News. All rights reserved"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Made With Love Text */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "نص 'صُنع بحب'" : "'Made With Love' Text"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "النص (عربي)" : "Text (Arabic)"}</Label>
                    <Input
                      value={formData.madeWithLoveTextAr || ""}
                      onChange={(e) => setFormData({ ...formData, madeWithLoveTextAr: e.target.value })}
                      placeholder="صُنع بـ ❤️ في السعودية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "النص (إنجليزي)" : "Text (English)"}</Label>
                    <Input
                      value={formData.madeWithLoveTextEn || ""}
                      onChange={(e) => setFormData({ ...formData, madeWithLoveTextEn: e.target.value })}
                      placeholder="Made with ❤️ in Saudi Arabia"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Footer Description */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "وصف الموقع في الفوتر" : "Site Description in Footer"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                    <Textarea
                      value={formData.footerDescriptionAr || ""}
                      onChange={(e) => setFormData({ ...formData, footerDescriptionAr: e.target.value })}
                      placeholder="منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية على مدار الساعة"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                    <Textarea
                      value={formData.footerDescriptionEn || ""}
                      onChange={(e) => setFormData({ ...formData, footerDescriptionEn: e.target.value })}
                      placeholder="Professional news platform providing latest news and exclusive reports 24/7"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Designer Company Link */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "رابط الشركة المصممة" : "Designer Company Link"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" 
                    ? "سيظهر في نص 'صُنع بحب' مع رابط للشركة المصممة للموقع"
                    : "Will appear in 'Made with love' text with a link to the designer company"
                  }
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "اسم الشركة المصممة" : "Designer Company Name"}</Label>
                    <Input
                      value={formData.designerCompanyName || ""}
                      onChange={(e) => setFormData({ ...formData, designerCompanyName: e.target.value })}
                      placeholder={language === "ar" ? "شركة التصميم" : "Design Company"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "رابط الشركة المصممة" : "Designer Company URL"}</Label>
                    <Input
                      value={formData.designerCompanyUrl || ""}
                      onChange={(e) => setFormData({ ...formData, designerCompanyUrl: e.target.value })}
                      placeholder="https://designcompany.com"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending 
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {language === "ar" ? "روابط وسائل التواصل الاجتماعي" : "Social Media Links"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "ar" 
                  ? "أضف روابط صفحاتك على وسائل التواصل الاجتماعي. سيتم عرض الأيقونات تلقائياً في صفحات المقالات."
                  : "Add your social media page links. Icons will be displayed automatically on article pages."
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Social Platforms */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "المنصات الرئيسية" : "Main Platforms"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      {language === "ar" ? "فيسبوك" : "Facebook"}
                    </Label>
                    <Input
                      value={formData.facebookUrl || ""}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">𝕏</span>
                      </div>
                      {language === "ar" ? "تويتر / X" : "Twitter / X"}
                    </Label>
                    <Input
                      value={formData.twitterUrl || ""}
                      onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500"></div>
                      {language === "ar" ? "إنستجرام" : "Instagram"}
                    </Label>
                    <Input
                      value={formData.instagramUrl || ""}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/yourprofile"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">▶</span>
                      </div>
                      {language === "ar" ? "يوتيوب" : "YouTube"}
                    </Label>
                    <Input
                      value={formData.youtubeUrl || ""}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      {language === "ar" ? "لينكد إن" : "LinkedIn"}
                    </Label>
                    <Input
                      value={formData.linkedinUrl || ""}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      {language === "ar" ? "واتساب" : "WhatsApp"}
                    </Label>
                    <Input
                      value={formData.whatsappUrl || ""}
                      onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                      placeholder="https://wa.me/1234567890"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Platforms */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "منصات إضافية" : "Additional Platforms"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✈</span>
                      </div>
                      {language === "ar" ? "تيليجرام" : "Telegram"}
                    </Label>
                    <Input
                      value={formData.telegramUrl || ""}
                      onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                      placeholder="https://t.me/yourchannel"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-black dark:bg-white"></div>
                      {language === "ar" ? "تيك توك" : "TikTok"}
                    </Label>
                    <Input
                      value={formData.tiktokUrl || ""}
                      onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                      placeholder="https://tiktok.com/@yourprofile"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-yellow-400 flex items-center justify-center">
                        <span className="text-black text-xs font-bold">👻</span>
                      </div>
                      {language === "ar" ? "سناب شات" : "Snapchat"}
                    </Label>
                    <Input
                      value={formData.snapchatUrl || ""}
                      onChange={(e) => setFormData({ ...formData, snapchatUrl: e.target.value })}
                      placeholder="https://snapchat.com/add/yourname"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      {language === "ar" ? "بينترست" : "Pinterest"}
                    </Label>
                    <Input
                      value={formData.pinterestUrl || ""}
                      onChange={(e) => setFormData({ ...formData, pinterestUrl: e.target.value })}
                      placeholder="https://pinterest.com/yourprofile"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">r</span>
                      </div>
                      {language === "ar" ? "ريديت" : "Reddit"}
                    </Label>
                    <Input
                      value={formData.redditUrl || ""}
                      onChange={(e) => setFormData({ ...formData, redditUrl: e.target.value })}
                      placeholder="https://reddit.com/r/yoursubreddit"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                      {language === "ar" ? "ديسكورد" : "Discord"}
                    </Label>
                    <Input
                      value={formData.discordUrl || ""}
                      onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                      placeholder="https://discord.gg/yourinvite"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-gray-800 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">⚡</span>
                      </div>
                      {language === "ar" ? "جيت هاب" : "GitHub"}
                    </Label>
                    <Input
                      value={formData.githubUrl || ""}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/yourorg"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Links */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "روابط الاتصال" : "Contact Links"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">@</span>
                      </div>
                      {language === "ar" ? "رابط البريد الإلكتروني" : "Email Link"}
                    </Label>
                    <Input
                      value={formData.emailUrl || ""}
                      onChange={(e) => setFormData({ ...formData, emailUrl: e.target.value })}
                      placeholder="mailto:contact@example.com"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" 
                        ? "أو سيتم استخدام البريد من الإعدادات العامة تلقائياً"
                        : "Or email from general settings will be used automatically"
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-teal-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">📞</span>
                      </div>
                      {language === "ar" ? "رابط الهاتف" : "Phone Link"}
                    </Label>
                    <Input
                      value={formData.phoneUrl || ""}
                      onChange={(e) => setFormData({ ...formData, phoneUrl: e.target.value })}
                      placeholder="tel:+1234567890"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" 
                        ? "أو سيتم استخدام الهاتف من الإعدادات العامة تلقائياً"
                        : "Or phone from general settings will be used automatically"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ روابط السوشيال ميديا" : "Save Social Media Links"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "إعدادات البريد الإلكتروني" : "Email Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={formData.smtpHost || ""}
                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={formData.smtpPort || ""}
                    onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                    placeholder="587"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "اسم المستخدم" : "Username"}</Label>
                  <Input
                    type="email"
                    value={formData.smtpUsername || ""}
                    onChange={(e) => setFormData({ ...formData, smtpUsername: e.target.value })}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "ar" ? "كلمة المرور" : "Password"}</Label>
                  <Input
                    type="password"
                    value={formData.smtpPassword || ""}
                    onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "إشعارات المقالات الجديدة" : "New Article Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إرسال بريد للمشتركين عند نشر مقال" : "Send email to subscribers on new article"}
                  </p>
                </div>
                <Switch
                  checked={formData.newArticleNotifications || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, newArticleNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "النشرة الإخبارية الأسبوعية" : "Weekly Newsletter"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إرسال ملخص أسبوعي" : "Send weekly digest"}
                  </p>
                </div>
                <Switch
                  checked={formData.weeklyNewsletter || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, weeklyNewsletter: checked })}
                />
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ وإرسال تجريبي" : "Save & Send Test"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "تحسين الأداء" : "Performance Optimization"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "التخزين المؤقت" : "Enable Caching"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "تفعيل التخزين المؤقت للصفحات" : "Enable page caching"}
                  </p>
                </div>
                <Switch
                  checked={formData.enableCaching || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableCaching: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "ضغط الصور تلقائياً" : "Auto Image Compression"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "ضغط الصور عند الرفع" : "Compress images on upload"}
                  </p>
                </div>
                <Switch
                  checked={formData.autoImageCompression || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoImageCompression: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "التحميل الكسول للصور" : "Lazy Load Images"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "تأخير تحميل الصور" : "Defer image loading"}
                  </p>
                </div>
                <Switch
                  checked={formData.lazyLoadImages || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, lazyLoadImages: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>CDN</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "استخدام شبكة توصيل المحتوى" : "Use Content Delivery Network"}
                  </p>
                </div>
                <Switch
                  checked={formData.cdnEnabled || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, cdnEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>CDN URL</Label>
                <Input
                  value={formData.cdnUrl || ""}
                  onChange={(e) => setFormData({ ...formData, cdnUrl: e.target.value })}
                  placeholder="https://cdn.example.com"
                />
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "إشعارات المتصفح" : "Browser Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "تفعيل إشعارات المتصفح" : "Enable browser push notifications"}
                  </p>
                </div>
                <Switch
                  checked={formData.browserNotifications || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, browserNotifications: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "إشعارات التعليقات" : "Comment Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إشعار عند تعليق جديد" : "Notify on new comment"}
                  </p>
                </div>
                <Switch
                  checked={formData.commentNotifications || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, commentNotifications: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "إشعارات المقالات المعلقة" : "Pending Article Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إشعار للمحررين عند مقال جديد" : "Notify editors on new article"}
                  </p>
                </div>
                <Switch
                  checked={formData.pendingArticleNotifications || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, pendingArticleNotifications: checked })}
                />
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "الإعدادات المتقدمة" : "Advanced Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "وضع المطور" : "Developer Mode"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "عرض معلومات إضافية للمطورين" : "Show additional developer info"}
                  </p>
                </div>
                <Switch
                  checked={formData.developerMode || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, developerMode: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === "ar" ? "تسجيل الأخطاء" : "Error Logging"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "حفظ الأخطاء في ملف" : "Save errors to file"}
                  </p>
                </div>
                <Switch
                  checked={formData.errorLogging || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, errorLogging: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{language === "ar" ? "قاعدة البيانات الاحتياطية" : "Database Backup"}</Label>
                <div className="flex gap-2">
                  <Button variant="outline">{language === "ar" ? "نسخة احتياطية يدوية" : "Manual Backup"}</Button>
                  <Button variant="outline">{language === "ar" ? "استعادة" : "Restore"}</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{language === "ar" ? "مسح ذاكرة التخزين المؤقت" : "Clear Cache"}</Label>
                <Button variant="destructive">{language === "ar" ? "مسح الكل" : "Clear All"}</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{language === "ar" ? "كود مخصص (CSS)" : "Custom CSS"}</Label>
                <Textarea
                  value={formData.customCss || ""}
                  onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                  placeholder="/* Add custom styles */"
                  rows={5}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "ar" ? "كود مخصص (JavaScript)" : "Custom JavaScript"}</Label>
                <Textarea
                  value={formData.customJs || ""}
                  onChange={(e) => setFormData({ ...formData, customJs: e.target.value })}
                  placeholder="// Add custom scripts"
                  rows={5}
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Search, BarChart3, FileText, Eye, Share2, TrendingUp, Link2, Target,
  Globe, Map, CheckCircle2, AlertCircle, RefreshCw, Download,
  Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle,
  Send, Music, Github, Chrome, Smartphone, Mail, Phone
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminSEO() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("U.N.N.T - أخبار الأمم المتحدة اليوم");
  const [previewDescription, setPreviewDescription] = useState("منصة إخبارية احترافية توفر آخر الأخبار والتقارير الحصرية");
  const [previewUrl, setPreviewUrl] = useState("https://example.com");
  
  // Social Media Links State
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    whatsapp: "",
    telegram: "",
    tiktok: "",
    github: "",
    email: "",
    phone: "",
    snapchat: "",
    pinterest: "",
    reddit: "",
    discord: ""
  });

  // Meta Tags State
  const [metaData, setMetaData] = useState({
    pageType: "article",
    titleTemplate: "{title} | {site_name}",
    descriptionTemplate: "{excerpt} - {category} | {site_name}",
    keywordsTemplate: "{tags}, {category}, أخبار",
    ogImage: "{cover_image}"
  });

  // Save Social Links Mutation
  const saveSocialMutation = useMutation({
    mutationFn: async (data: typeof socialLinks) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebookUrl: data.facebook,
          twitterUrl: data.twitter,
          instagramUrl: data.instagram,
          linkedinUrl: data.linkedin,
          youtubeUrl: data.youtube,
          whatsappUrl: data.whatsapp,
          telegramUrl: data.telegram,
          tiktokUrl: data.tiktok,
          githubUrl: data.github,
          emailUrl: data.email,
          phoneUrl: data.phone,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: language === "ar" ? "تم الحفظ ✅" : "Saved ✅",
        description: language === "ar" ? "تم حفظ روابط السوشيال ميديا بنجاح" : "Social media links saved successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ ❌" : "Error ❌",
        description: language === "ar" ? "فشل حفظ الروابط" : "Failed to save links",
        variant: "destructive",
      });
    },
  });

  // Save Meta Tags Mutation
  const saveMetaMutation = useMutation({
    mutationFn: async (data: typeof metaData) => {
      const response = await fetch("/api/admin/seo/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم الحفظ ✅" : "Saved ✅",
        description: language === "ar" ? "تم حفظ قوالب Meta Tags بنجاح" : "Meta tags templates saved successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ ❌" : "Error ❌",
        description: language === "ar" ? "فشل حفظ القوالب" : "Failed to save templates",
        variant: "destructive",
      });
    },
  });

  const handleSaveSocial = () => {
    saveSocialMutation.mutate(socialLinks);
  };

  const handleSaveMeta = () => {
    saveMetaMutation.mutate(metaData);
  };

  const seoScore = 85;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "إدارة SEO" : "SEO Management"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "نظام متقدم لتحسين محركات البحث" : "Advanced search engine optimization system"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {language === "ar" ? "تصدير تقرير" : "Export Report"}
          </Button>
          <Button onClick={() => setAnalyzing(true)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
            {language === "ar" ? "تحليل الموقع" : "Analyze Site"}
          </Button>
        </div>
      </div>

      {/* SEO Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "نقاط SEO الإجمالية" : "Overall SEO Score"}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}/100</div>
            <Progress value={seoScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language === "ar" ? "+5 من الأسبوع الماضي" : "+5 from last week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "الكلمات المفتاحية" : "Tracked Keywords"}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === "ar" ? "23 في المراكز الأولى" : "23 in top positions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "الروابط الخلفية" : "Backlinks"}
            </CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,432</div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === "ar" ? "+87 هذا الشهر" : "+87 this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "ar" ? "الترتيب المتوسط" : "Avg. Ranking"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.4</div>
            <p className="text-xs text-green-500 mt-2">
              {language === "ar" ? "تحسن بمقدار 3.2" : "Improved by 3.2"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            {language === "ar" ? "معاينة" : "Preview"}
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Search className="h-4 w-4 mr-2" />
            {language === "ar" ? "تحليل" : "Analysis"}
          </TabsTrigger>
          <TabsTrigger value="meta">
            <FileText className="h-4 w-4 mr-2" />
            Meta
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            {language === "ar" ? "سوشيال" : "Social"}
          </TabsTrigger>
          <TabsTrigger value="sitemap">
            <Map className="h-4 w-4 mr-2" />
            {language === "ar" ? "خريطة" : "Sitemap"}
          </TabsTrigger>
        </TabsList>

        {/* SEO Preview Tab - NEW */}
        <TabsContent value="preview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor Section */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "تحرير معلومات SEO" : "Edit SEO Information"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "ar" ? "عنوان الصفحة" : "Page Title"}</Label>
                  <Input 
                    value={previewTitle}
                    onChange={(e) => setPreviewTitle(e.target.value)}
                    maxLength={60}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={previewTitle.length > 60 ? "text-red-500" : "text-muted-foreground"}>
                      {previewTitle.length}/60 {language === "ar" ? "حرف" : "characters"}
                    </span>
                    {previewTitle.length > 60 && (
                      <span className="text-red-500">{language === "ar" ? "طويل جداً!" : "Too long!"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === "ar" ? "وصف الصفحة" : "Meta Description"}</Label>
                  <Textarea 
                    value={previewDescription}
                    onChange={(e) => setPreviewDescription(e.target.value)}
                    maxLength={160}
                    rows={3}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={previewDescription.length > 160 ? "text-red-500" : "text-muted-foreground"}>
                      {previewDescription.length}/160 {language === "ar" ? "حرف" : "characters"}
                    </span>
                    {previewDescription.length > 160 && (
                      <span className="text-red-500">{language === "ar" ? "طويل جداً!" : "Too long!"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === "ar" ? "رابط الصفحة" : "Page URL"}</Label>
                  <Input 
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="https://example.com/article/..."
                  />
                </div>

                <Separator />

                {/* SEO Score Indicators */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">{language === "ar" ? "مؤشرات الجودة" : "Quality Indicators"}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{language === "ar" ? "طول العنوان مثالي" : "Title length optimal"}</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">✓</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{language === "ar" ? "الوصف واضح" : "Description clear"}</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">✓</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{language === "ar" ? "أضف كلمات مفتاحية" : "Add keywords"}</span>
                      </div>
                      <Badge variant="secondary">!</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <Button 
                  className="w-full" 
                  onClick={handleSaveMeta}
                  disabled={saveMetaMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {saveMetaMutation.isPending
                    ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                    : (language === "ar" ? "حفظ التغييرات" : "Save Changes")}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <div className="space-y-4">
              {/* Google Search Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    {language === "ar" ? "معاينة Google" : "Google Preview"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    {/* Google Logo */}
                    <div className="mb-4 flex items-center gap-2">
                      <div className="w-20 h-7 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded"></div>
                      <Input placeholder={language === "ar" ? "ابحث في Google" : "Search Google"} className="text-sm" />
                    </div>
                    <Separator className="mb-4" />
                    {/* Search Result */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{previewUrl}</span>
                      </div>
                      <h3 className="text-xl text-blue-600 hover:underline cursor-pointer line-clamp-1">
                        {previewTitle || "عنوان الصفحة"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {previewDescription || "وصف الصفحة سيظهر هنا..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {language === "ar" ? "معاينة الموبايل" : "Mobile Preview"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto max-w-[280px] p-3 bg-white dark:bg-gray-900 rounded-lg border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                        <Globe className="h-2.5 w-2.5" />
                        <span className="truncate">{new URL(previewUrl || "https://example.com").hostname}</span>
                      </div>
                      <h3 className="text-sm font-medium text-blue-600 line-clamp-2">
                        {previewTitle || "عنوان الصفحة"}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {previewDescription || "وصف الصفحة..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    {language === "ar" ? "معاينة السوشيال" : "Social Preview"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <div className="aspect-[1.91/1] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3"></div>
                    <h4 className="font-semibold line-clamp-1 mb-1">{previewTitle}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {previewDescription}
                    </p>
                    <span className="text-xs text-gray-500">{new URL(previewUrl || "https://example.com").hostname}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "تحليل الصفحات" : "Page Analysis"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder={language === "ar" ? "أدخل رابط الصفحة..." : "Enter page URL..."} />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  {language === "ar" ? "تحليل" : "Analyze"}
                </Button>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{language === "ar" ? "عنوان الصفحة" : "Page Title"}</p>
                      <p className="text-sm text-muted-foreground">55 {language === "ar" ? "حرف" : "characters"}</p>
                    </div>
                  </div>
                  <Badge variant="default">✓ {language === "ar" ? "ممتاز" : "Excellent"}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{language === "ar" ? "وصف Meta" : "Meta Description"}</p>
                      <p className="text-sm text-muted-foreground">185 {language === "ar" ? "حرف" : "characters"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{language === "ar" ? "طويل جداً" : "Too Long"}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{language === "ar" ? "الصور" : "Images"}</p>
                      <p className="text-sm text-muted-foreground">12/12 {language === "ar" ? "لديها نص بديل" : "have alt text"}</p>
                    </div>
                  </div>
                  <Badge variant="default">✓ {language === "ar" ? "ممتاز" : "Excellent"}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{language === "ar" ? "الروابط الداخلية" : "Internal Links"}</p>
                      <p className="text-sm text-muted-foreground">23 {language === "ar" ? "رابط" : "links"}</p>
                    </div>
                  </div>
                  <Badge variant="default">✓ {language === "ar" ? "جيد" : "Good"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab - NEW */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "روابط السوشيال ميديا" : "Social Media Links"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "أضف روابط حساباتك على منصات التواصل الاجتماعي. ستظهر الأيقونات فقط للروابط المفعلة." : "Add your social media account links. Icons will only appear for active links."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Facebook */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input 
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                    placeholder="https://facebook.com/yourpage" 
                  />
                </div>

                {/* Twitter/X */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter / X
                  </Label>
                  <Input 
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                    placeholder="https://twitter.com/youraccount" 
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input 
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                    placeholder="https://instagram.com/youraccount" 
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input 
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/company/yourcompany" 
                  />
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input 
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                    placeholder="https://youtube.com/@yourchannel" 
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </Label>
                  <Input 
                    value={socialLinks.whatsapp}
                    onChange={(e) => setSocialLinks({...socialLinks, whatsapp: e.target.value})}
                    placeholder="https://wa.me/1234567890" 
                  />
                </div>

                {/* Telegram */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-500" />
                    Telegram
                  </Label>
                  <Input 
                    value={socialLinks.telegram}
                    onChange={(e) => setSocialLinks({...socialLinks, telegram: e.target.value})}
                    placeholder="https://t.me/yourchannel" 
                  />
                </div>

                {/* TikTok */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    TikTok
                  </Label>
                  <Input 
                    value={socialLinks.tiktok}
                    onChange={(e) => setSocialLinks({...socialLinks, tiktok: e.target.value})}
                    placeholder="https://tiktok.com/@youraccount" 
                  />
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input 
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                    placeholder="https://github.com/youraccount" 
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input 
                    value={socialLinks.email}
                    onChange={(e) => setSocialLinks({...socialLinks, email: e.target.value})}
                    placeholder="contact@example.com" 
                    type="email" 
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {language === "ar" ? "رقم الهاتف" : "Phone"}
                  </Label>
                  <Input 
                    value={socialLinks.phone}
                    onChange={(e) => setSocialLinks({...socialLinks, phone: e.target.value})}
                    placeholder="+1234567890" 
                    type="tel" 
                  />
                </div>

                {/* Snapchat */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-yellow-400 rounded-sm"></div>
                    Snapchat
                  </Label>
                  <Input placeholder="https://snapchat.com/add/youraccount" />
                </div>

                {/* Pinterest */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                    Pinterest
                  </Label>
                  <Input placeholder="https://pinterest.com/youraccount" />
                </div>

                {/* Reddit */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
                    Reddit
                  </Label>
                  <Input placeholder="https://reddit.com/r/yoursubreddit" />
                </div>

                {/* Discord */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-indigo-600 rounded-sm"></div>
                    Discord
                  </Label>
                  <Input placeholder="https://discord.gg/yourinvite" />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Preview Section */}
              <div className="space-y-4">
                <h4 className="font-semibold">{language === "ar" ? "معاينة الأيقونات" : "Icons Preview"}</h4>
                <div className="flex flex-wrap gap-3 p-4 bg-muted rounded-lg">
                  <Button size="icon" variant="outline" className="hover:bg-blue-600 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-sky-500 hover:text-white">
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-pink-600 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-blue-700 hover:text-white">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-red-600 hover:text-white">
                    <Youtube className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-green-600 hover:text-white">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-blue-500 hover:text-white">
                    <Send className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-black hover:text-white">
                    <Music className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-gray-800 hover:text-white">
                    <Github className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:bg-primary hover:text-white">
                    <Mail className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "ملاحظة: ستظهر الأيقونات في الموقع فقط للروابط التي تم إدخالها وحفظها." : "Note: Icons will only appear on the website for links that have been entered and saved."}
                </p>
              </div>

              <Button 
                className="w-full mt-6" 
                onClick={handleSaveSocial}
                disabled={saveSocialMutation.isPending}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {saveSocialMutation.isPending 
                  ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                  : (language === "ar" ? "حفظ روابط السوشيال ميديا" : "Save Social Media Links")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Tags Templates Tab - ENHANCED */}
        <TabsContent value="meta" className="space-y-4">
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{language === "ar" ? "قوالب Meta Tags المحسّنة" : "Enhanced Meta Tags Templates"}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "ar" 
                      ? "قم بتخصيص قوالب Meta Tags لتحسين ظهور موقعك في محركات البحث"
                      : "Customize Meta Tags templates to improve your site's search engine visibility"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Page Type Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">{language === "ar" ? "نوع الصفحة" : "Page Type"}</Label>
                </div>
                <Select 
                  value={metaData.pageType}
                  onValueChange={(value) => setMetaData({...metaData, pageType: value})}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article" className="text-base">
                      <div className="flex items-center gap-2 py-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{language === "ar" ? "📄 مقالة" : "📄 Article"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="category" className="text-base">
                      <div className="flex items-center gap-2 py-1">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span>{language === "ar" ? "📁 قسم" : "📁 Category"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="home" className="text-base">
                      <div className="flex items-center gap-2 py-1">
                        <Chrome className="h-4 w-4 text-purple-600" />
                        <span>{language === "ar" ? "🏠 الرئيسية" : "🏠 Homepage"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="author" className="text-base">
                      <div className="flex items-center gap-2 py-1">
                        <Mail className="h-4 w-4 text-orange-600" />
                        <span>{language === "ar" ? "✍️ كاتب" : "✍️ Author"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-6" />

              {/* Title Template */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-semibold">{language === "ar" ? "قالب العنوان" : "Title Template"}</Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {language === "ar" ? "الحد الأقصى: 60 حرف" : "Max: 60 chars"}
                  </Badge>
                </div>
                <Input 
                  value={metaData.titleTemplate}
                  onChange={(e) => setMetaData({...metaData, titleTemplate: e.target.value})}
                  placeholder="{title} | {site_name}" 
                  className="h-12 text-base font-mono bg-white dark:bg-gray-900"
                />
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
                  <p className="text-xs font-semibold mb-2 text-blue-700 dark:text-blue-300">
                    {language === "ar" ? "💡 المتغيرات المتاحة:" : "💡 Available variables:"}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{title}"}</code>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{site_name}"}</code>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{category}"}</code>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{author}"}</code>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{date}"}</code>
                    <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono">{"{year}"}</code>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                    ✅ {language === "ar" ? "مثال على النتيجة:" : "Example output:"}
                  </p>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {language === "ar" ? "قمة المناخ العالمية 2024 | U.N.N.T" : "Global Climate Summit 2024 | U.N.N.T"}
                  </p>
                </div>
              </div>

              {/* Description Template */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-semibold">{language === "ar" ? "قالب الوصف" : "Description Template"}</Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {language === "ar" ? "الحد الأقصى: 160 حرف" : "Max: 160 chars"}
                  </Badge>
                </div>
                <Textarea 
                  value={metaData.descriptionTemplate}
                  onChange={(e) => setMetaData({...metaData, descriptionTemplate: e.target.value})}
                  placeholder="{excerpt} - {category} | {site_name}" 
                  rows={3}
                  className="text-base font-mono bg-white dark:bg-gray-900 resize-none"
                />
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
                  <p className="text-xs font-semibold mb-2 text-purple-700 dark:text-purple-300">
                    {language === "ar" ? "💡 المتغيرات المتاحة:" : "💡 Available variables:"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <code className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded font-mono">{"{excerpt}"}</code>
                    <code className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded font-mono">{"{category}"}</code>
                    <code className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded font-mono">{"{site_name}"}</code>
                    <code className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded font-mono">{"{author}"}</code>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                    ✅ {language === "ar" ? "مثال على النتيجة:" : "Example output:"}
                  </p>
                  <p className="text-sm text-green-900 dark:text-green-100">
                    {language === "ar" 
                      ? "تفاصيل شاملة عن قمة المناخ العالمية وأهم القرارات - سياسة | U.N.N.T"
                      : "Comprehensive details about the Global Climate Summit and key decisions - Politics | U.N.N.T"}
                  </p>
                </div>
              </div>

              {/* Keywords Template */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-semibold">{language === "ar" ? "قالب الكلمات المفتاحية" : "Keywords Template"}</Label>
                </div>
                <Input 
                  value={metaData.keywordsTemplate}
                  onChange={(e) => setMetaData({...metaData, keywordsTemplate: e.target.value})}
                  placeholder="{tags}, {category}, أخبار" 
                  className="h-12 text-base font-mono bg-white dark:bg-gray-900"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {language === "ar" 
                    ? "استخدم الفواصل للفصل بين الكلمات المفتاحية"
                    : "Use commas to separate keywords"}
                </p>
              </div>

              {/* Open Graph Image */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-orange-600" />
                  <Label className="text-base font-semibold">{language === "ar" ? "صورة Open Graph" : "Open Graph Image"}</Label>
                </div>
                <Input 
                  value={metaData.ogImage}
                  onChange={(e) => setMetaData({...metaData, ogImage: e.target.value})}
                  placeholder="{cover_image}" 
                  className="h-12 text-base font-mono bg-white dark:bg-gray-900"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {language === "ar" 
                    ? "الحجم الموصى به: 1200x630 بكسل"
                    : "Recommended size: 1200x630 pixels"}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Save Button */}
              <Button 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleSaveMeta}
                disabled={saveMetaMutation.isPending}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {saveMetaMutation.isPending
                  ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                  : (language === "ar" ? "حفظ القالب" : "Save Template")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "خريطة الموقع" : "Sitemap Management"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">sitemap.xml</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "آخر تحديث: منذ ساعة" : "Last updated: 1 hour ago"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {language === "ar" ? "تحميل" : "Download"}
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "ar" ? "تحديث" : "Regenerate"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "إعدادات خريطة الموقع" : "Sitemap Settings"}</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{language === "ar" ? "تضمين المقالات" : "Include Articles"}</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{language === "ar" ? "تضمين الأقسام" : "Include Categories"}</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{language === "ar" ? "تضمين الكتّاب" : "Include Authors"}</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{language === "ar" ? "تضمين الوسائط" : "Include Media"}</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Robots.txt</Label>
                <Textarea 
                  className="font-mono text-xs"
                  rows={8}
                  defaultValue={`User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

Sitemap: https://example.com/sitemap.xml`}
                />
              </div>

              <Button className="w-full">
                {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

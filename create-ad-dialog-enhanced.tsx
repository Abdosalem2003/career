import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Image as ImageIcon, Settings, BarChart3, DollarSign, Target } from "lucide-react";

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdDialogEnhanced({ open, onOpenChange }: CreateAdDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    placement: "header",
    filePath: "",
    url: "",
    active: true,
    startDate: "",
    endDate: "",
    budget: 0,
    dailyBudget: 0,
    targetAudience: "",
    keywords: "",
    enableTracking: true,
    enableRetargeting: false,
    conversionGoal: "clicks",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPlacement, setSelectedPlacement] = useState("header");

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Success",
        description: language === "ar" ? "تم إنشاء الإعلان بنجاح" : "Ad created successfully",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        placement: "header",
        filePath: "",
        url: "",
        active: true,
        startDate: "",
        endDate: "",
        budget: 0,
        dailyBudget: 0,
        targetAudience: "",
        keywords: "",
        enableTracking: true,
        enableRetargeting: false,
        conversionGoal: "clicks",
      });
      setPreviewUrl("");
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء الإعلان" : "Failed to create ad",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.filePath) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const placementSizes: Record<string, { width: number; height: number }> = {
    header: { width: 1200, height: 90 },
    "sidebar-top": { width: 300, height: 250 },
    "sidebar-middle": { width: 300, height: 250 },
    "in-article": { width: 600, height: 300 },
    footer: { width: 1200, height: 90 },
  };

  const size = placementSizes[formData.placement];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {language === "ar" ? "إنشاء إعلان جديد" : "Create New Ad"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "أضف إعلان جديد مع تحديد الموقع والميزانية والاستهداف"
              : "Add a new ad with placement, budget, and targeting options"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">{language === "ar" ? "أساسي" : "Basic"}</TabsTrigger>
            <TabsTrigger value="placement">{language === "ar" ? "الموقع" : "Placement"}</TabsTrigger>
            <TabsTrigger value="budget">{language === "ar" ? "الميزانية" : "Budget"}</TabsTrigger>
            <TabsTrigger value="targeting">{language === "ar" ? "الاستهداف" : "Targeting"}</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {language === "ar" ? "اسم الإعلان *" : "Ad Name *"}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === "ar" ? "مثال: إعلان منتج جديد" : "e.g., New Product Ad"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {language === "ar" ? "الوصف" : "Description"}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === "ar" ? "اكتب وصف الإعلان" : "Write ad description"}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filePath" className="text-sm font-medium">
                  {language === "ar" ? "رابط الصورة *" : "Image URL *"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="filePath"
                    type="url"
                    value={formData.filePath}
                    onChange={(e) => {
                      setFormData({ ...formData, filePath: e.target.value });
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  {language === "ar" ? "رابط الإعلان" : "Ad URL"}
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active" className="text-sm font-medium">
                  {language === "ar" ? "تفعيل الإعلان" : "Activate Ad"}
                </Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </TabsContent>

            {/* Placement Tab */}
            <TabsContent value="placement" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="placement" className="text-sm font-medium">
                  {language === "ar" ? "موقع الإعلان *" : "Ad Placement *"}
                </Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => {
                    setFormData({ ...formData, placement: value });
                    setSelectedPlacement(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">
                      {language === "ar" ? "رأس الصفحة (1200×90)" : "Header (1200×90)"}
                    </SelectItem>
                    <SelectItem value="sidebar-top">
                      {language === "ar" ? "الشريط الجانبي - أعلى (300×250)" : "Sidebar Top (300×250)"}
                    </SelectItem>
                    <SelectItem value="sidebar-middle">
                      {language === "ar" ? "الشريط الجانبي - وسط (300×250)" : "Sidebar Middle (300×250)"}
                    </SelectItem>
                    <SelectItem value="in-article">
                      {language === "ar" ? "داخل المقال (600×300)" : "In Article (600×300)"}
                    </SelectItem>
                    <SelectItem value="footer">
                      {language === "ar" ? "التذييل (1200×90)" : "Footer (1200×90)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === "ar" ? "معاينة الإعلان" : "Ad Preview"}
                </Label>
                <Card className="bg-gray-50">
                  <CardContent className="p-4 flex items-center justify-center" style={{ minHeight: "200px" }}>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: `${size.width}px`,
                          maxHeight: `${size.height}px`,
                          objectFit: "contain",
                        }}
                        onError={() => (
                          <div className="text-center text-muted-foreground">
                            {language === "ar" ? "لم يتمكن من تحميل الصورة" : "Failed to load image"}
                          </div>
                        )}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{language === "ar" ? "أدخل رابط الصورة لمعاينتها" : "Enter image URL to preview"}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    {language === "ar" ? "تاريخ البداية" : "Start Date"}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    {language === "ar" ? "تاريخ النهاية" : "End Date"}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {language === "ar" ? "إجمالي الميزانية" : "Total Budget"}
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyBudget" className="text-sm font-medium">
                  {language === "ar" ? "الميزانية اليومية" : "Daily Budget"}
                </Label>
                <Input
                  id="dailyBudget"
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => setFormData({ ...formData, dailyBudget: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3 text-sm">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {language === "ar" ? "نصيحة الميزانية" : "Budget Tip"}
                      </p>
                      <p className="text-blue-800 mt-1">
                        {language === "ar"
                          ? "حدد ميزانية يومية لتوزيع الإنفاق بشكل متساوٍ طوال فترة الإعلان"
                          : "Set a daily budget to distribute spending evenly throughout the campaign"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Targeting Tab */}
            <TabsContent value="targeting" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}
                </Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder={language === "ar" ? "مثال: الرجال 25-45 سنة، المهتمون بالتكنولوجيا" : "e.g., Men 25-45, Tech enthusiasts"}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sm font-medium">
                  {language === "ar" ? "الكلمات المفتاحية" : "Keywords"}
                </Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder={language === "ar" ? "فصل الكلمات بفواصل" : "Separate keywords with commas"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversionGoal" className="text-sm font-medium">
                  {language === "ar" ? "هدف التحويل" : "Conversion Goal"}
                </Label>
                <Select value={formData.conversionGoal} onValueChange={(value) => setFormData({ ...formData, conversionGoal: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clicks">{language === "ar" ? "النقرات" : "Clicks"}</SelectItem>
                    <SelectItem value="impressions">{language === "ar" ? "المشاهدات" : "Impressions"}</SelectItem>
                    <SelectItem value="conversions">{language === "ar" ? "التحويلات" : "Conversions"}</SelectItem>
                    <SelectItem value="leads">{language === "ar" ? "العملاء المحتملين" : "Leads"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableTracking" className="text-sm font-medium">
                    {language === "ar" ? "تفعيل التتبع" : "Enable Tracking"}
                  </Label>
                  <Switch
                    id="enableTracking"
                    checked={formData.enableTracking}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableTracking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRetargeting" className="text-sm font-medium">
                    {language === "ar" ? "إعادة الاستهداف" : "Enable Retargeting"}
                  </Label>
                  <Switch
                    id="enableRetargeting"
                    checked={formData.enableRetargeting}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableRetargeting: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {createMutation.isPending
              ? language === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : language === "ar"
              ? "حفظ الإعلان"
              : "Save Ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

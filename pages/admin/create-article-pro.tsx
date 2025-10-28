import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { AdvancedSEOPanel } from '@/components/admin/advanced-seo-panel';
import { ImageUploaderAdvanced } from '@/components/admin/image-uploader-advanced';
import { 
  Save, Eye, Send, Clock, Image as ImageIcon, Upload, X, 
  ArrowLeft, Calendar, Tag, Folder, User, Star, Sparkles
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  role?: string;
}

export default function CreateArticlePro() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('content');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    slug: '',
    excerptAr: '',
    excerptEn: '',
    contentAr: '',
    contentEn: '',
    coverImage: '',
    gallery: [] as string[],
    categoryId: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    featured: false,
    specialReport: false,
    specialReportOrder: 0,
    publishedAt: '',
    seoMeta: {
      titleEn: '' as string | undefined,
      titleAr: '' as string | undefined,
      descriptionEn: '' as string | undefined,
      descriptionAr: '' as string | undefined,
      keywords: '' as string | undefined,
      ogImage: '' as string | undefined,
      canonicalUrl: '' as string | undefined
    }
  });

  const [newTag, setNewTag] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch Current User
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: 1,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.titleEn && !formData.slug) {
      const slug = formData.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.titleEn]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      if (formData.titleAr || formData.titleEn) {
        localStorage.setItem('article-draft', JSON.stringify(formData));
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('article-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Ensure arrays exist
        setFormData({
          ...parsed,
          gallery: parsed.gallery || [],
          tags: parsed.tags || [],
        });
        toast({
          title: 'تم استعادة المسودة',
          description: 'تم تحميل آخر مسودة محفوظة',
        });
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }, []);

  // Create Article Mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/dash-unnt-2025/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          authorId: currentUser?.id,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء المقال');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dash-unnt-2025/articles'] });
      localStorage.removeItem('article-draft');
      toast({
        title: 'تم الإنشاء',
        description: 'تم إنشاء المقال بنجاح',
      });
      setLocation('/dash-unnt-2025/articles');
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Upload Image
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const response = await fetch('/api/dash-unnt-2025/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64,
              fileName: file.name,
              mimeType: file.type,
            }),
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            resolve(data.url);
          } else {
            reject(new Error('فشل رفع الصورة'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: url }));
      toast({
        title: 'تم الرفع',
        description: 'تم رفع صورة الغلاف بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل رفع الصورة',
        variant: 'destructive',
      });
    }
  };

  const addToGallery = () => {
    if (galleryUrl && formData.gallery && !formData.gallery.includes(galleryUrl)) {
      setFormData(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), galleryUrl]
      }));
      setGalleryUrl('');
    }
  };

  const removeFromGallery = (url: string) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter(img => img !== url)
    }));
  };

  const addTag = () => {
    if (newTag && formData.tags && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const handleSubmit = (status: 'draft' | 'published' | 'scheduled') => {
    createMutation.mutate({
      ...formData,
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : formData.publishedAt
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/dash-unnt-2025/articles')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              محرر المقالات الاحترافي
            </h1>
            <p className="text-muted-foreground">
              أنشئ مقالات احترافية مع محرر متقدم وأدوات SEO قوية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && autoSaveEnabled && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG')}
            </span>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={createMutation.isPending}
          >
            <Save className="h-4 w-4 ml-2" />
            حفظ كمسودة
          </Button>

          <Button
            variant="default"
            onClick={() => handleSubmit('published')}
            disabled={createMutation.isPending}
          >
            <Send className="h-4 w-4 ml-2" />
            نشر الآن
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="media">الوسائط</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>العنوان والمحتوى</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>العنوان (عربي) *</Label>
                    <Input
                      value={formData.titleAr}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                      placeholder="عنوان المقال بالعربية..."
                      dir="rtl"
                      className="text-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>العنوان (English)</Label>
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="Article title in English..."
                      dir="ltr"
                      className="text-xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الرابط (Slug)</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-slug"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المقدمة (عربي)</Label>
                    <Textarea
                      value={formData.excerptAr}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerptAr: e.target.value }))}
                      placeholder="مقدمة مختصرة للمقال..."
                      dir="rtl"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المقدمة (English)</Label>
                    <Textarea
                      value={formData.excerptEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerptEn: e.target.value }))}
                      placeholder="Brief excerpt..."
                      dir="ltr"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المحتوى (عربي) *</Label>
                    <RichTextEditor
                      content={formData.contentAr}
                      onChange={(content) => setFormData(prev => ({ ...prev, contentAr: content }))}
                      placeholder="ابدأ الكتابة..."
                      language="ar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المحتوى (English)</Label>
                    <RichTextEditor
                      content={formData.contentEn}
                      onChange={(content) => setFormData(prev => ({ ...prev, contentEn: content }))}
                      placeholder="Start writing..."
                      language="en"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo">
              <AdvancedSEOPanel
                data={formData.seoMeta}
                onChange={(seoMeta) => setFormData(prev => ({ ...prev, seoMeta: { ...prev.seoMeta, ...seoMeta } }))}
                articleTitle={formData.titleAr}
                articleExcerpt={formData.excerptAr}
                language="ar"
              />
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    صورة الغلاف
                  </CardTitle>
                  <CardDescription>
                    الصورة الرئيسية التي تظهر في بطاقة المقال
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="flex-1"
                    />
                  </div>

                  {formData.coverImage && (
                    <div className="relative">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    معرض الصور
                  </CardTitle>
                  <CardDescription>
                    ارفع عدد لا نهائي من الصور بالسحب والإفلات - يدعم الضغط التلقائي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploaderAdvanced
                    onImagesUploaded={(urls) => {
                      setFormData(prev => ({
                        ...prev,
                        gallery: [...(prev.gallery || []), ...urls]
                      }));
                    }}
                    maxImages={50}
                    maxSizePerImage={10}
                    language="ar"
                  />

                  {/* Existing Gallery Images */}
                  {formData.gallery && formData.gallery.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">الصور المضافة ({formData.gallery.length})</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {formData.gallery.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeFromGallery(url)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات المقال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>حفظ تلقائي</Label>
                    <Switch
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>مقال مميز</Label>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>تقرير خاص</Label>
                    <Switch
                      checked={formData.specialReport}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, specialReport: checked }))}
                    />
                  </div>

                  {formData.specialReport && (
                    <div className="space-y-2">
                      <Label>ترتيب التقرير الخاص</Label>
                      <Input
                        type="number"
                        value={formData.specialReportOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialReportOrder: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>جدولة النشر</Label>
                    <Input
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                القسم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                الوسوم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="أضف وسم..."
                  dir="rtl"
                />
                <Button onClick={addTag} size="icon">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                الكاتب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {currentUser.profileImage && (
                      <img 
                        src={currentUser.profileImage} 
                        alt="Author"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {currentUser.fullName || 'كاتب'}
                      </p>
                      {currentUser.role && (
                        <p className="text-xs text-muted-foreground">
                          {currentUser.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">جاري التحميل...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

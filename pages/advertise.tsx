import { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SuccessCelebration } from '@/components/success-celebration';
import { 
  Megaphone, 
  Upload, 
  Link as LinkIcon, 
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const adPlacements = [
  {
    id: 'header',
    nameAr: 'رأس الصفحة',
    nameEn: 'Header Banner',
    descriptionAr: 'إعلان كبير في أعلى الصفحة - أعلى نسبة مشاهدة',
    descriptionEn: 'Large banner at the top of the page - Highest visibility',
    icon: '📱',
    recommended: true
  },
  {
    id: 'sidebar-top',
    nameAr: 'الشريط الجانبي (أعلى)',
    nameEn: 'Sidebar Top',
    descriptionAr: 'إعلان في الشريط الجانبي الأيمن أعلى الصفحة',
    descriptionEn: 'Ad in the right sidebar at the top',
    icon: '📊'
  },
  {
    id: 'sidebar-middle',
    nameAr: 'الشريط الجانبي (وسط)',
    nameEn: 'Sidebar Middle',
    descriptionAr: 'إعلان في منتصف الشريط الجانبي',
    descriptionEn: 'Ad in the middle of the sidebar',
    icon: '📈'
  },
  {
    id: 'in-article',
    nameAr: 'داخل المقال',
    nameEn: 'In-Article',
    descriptionAr: 'إعلان يظهر داخل محتوى المقال - تفاعل عالي',
    descriptionEn: 'Ad appears within article content - High engagement',
    icon: '📰',
    recommended: true
  },
  {
    id: 'footer',
    nameAr: 'أسفل الصفحة',
    nameEn: 'Footer Banner',
    descriptionAr: 'إعلان في أسفل الصفحة',
    descriptionEn: 'Banner at the bottom of the page',
    icon: '📌'
  }
];

export default function AdvertisePage() {
  const { language } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    placement: '',
    adUrl: '',
    duration: '',
    message: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // رفع الصورة أولاً
      let imagePath = '';
      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        const base64 = await base64Promise;

        const uploadResponse = await fetch('/api/ad-requests/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, filename: imageFile.name })
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadResponse.json();
        imagePath = uploadData.path;
      }

      // إرسال الطلب
      const response = await fetch('/api/ad-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imagePath,
          duration: parseInt(formData.duration)
        })
      });

      if (!response.ok) throw new Error('Failed to submit request');

      // عرض رسالة النجاح
      setShowSuccess(true);

      // إعادة تعيين النموذج
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          placement: '',
          adUrl: '',
          duration: '',
          message: ''
        });
        setImageFile(null);
        setImagePreview('');
      }, 4000);

    } catch (error) {
      console.error('Error submitting ad request:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
        : 'An error occurred while submitting the request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <Megaphone className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'أعلن معنا' : 'Advertise With Us'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar'
              ? 'اختر المساحة الإعلانية المناسبة لك وابدأ في الوصول إلى جمهورنا الواسع'
              : 'Choose the right ad space for you and start reaching our wide audience'
            }
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Ad Placement Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {language === 'ar' ? 'اختر موقع الإعلان' : 'Choose Ad Placement'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.placement}
                  onValueChange={(value) => setFormData({ ...formData, placement: value })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {adPlacements.map((placement) => (
                    <Label
                      key={placement.id}
                      htmlFor={placement.id}
                      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.placement === placement.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={placement.id} id={placement.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{placement.icon}</span>
                            <span className="font-bold">
                              {language === 'ar' ? placement.nameAr : placement.nameEn}
                            </span>
                            {placement.recommended && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full">
                                {language === 'ar' ? 'مُوصى به' : 'Recommended'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? placement.descriptionAr : placement.descriptionEn}
                          </p>
                        </div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={language === 'ar' ? '+966 xx xxx xxxx' : '+966 xx xxx xxxx'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder={language === 'ar' ? 'اسم شركتك (اختياري)' : 'Your company name (optional)'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ad Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-green-600" />
                  {language === 'ar' ? 'تفاصيل الإعلان' : 'Ad Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adUrl" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    {language === 'ar' ? 'رابط الإعلان' : 'Ad URL'} *
                  </Label>
                  <Input
                    id="adUrl"
                    type="url"
                    required
                    value={formData.adUrl}
                    onChange={(e) => setFormData({ ...formData, adUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'الرابط الذي سيتم توجيه الزوار إليه عند النقر على الإعلان'
                      : 'The link visitors will be directed to when clicking the ad'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {language === 'ar' ? 'صورة الإعلان' : 'Ad Image'} *
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'انقر لتغيير الصورة' : 'Click to change image'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar'
                            ? 'انقر لرفع صورة الإعلان (PNG, JPG, GIF)'
                            : 'Click to upload ad image (PNG, JPG, GIF)'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {language === 'ar' ? 'مدة الإعلان (بالأيام)' : 'Ad Duration (in days)'} *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: 30' : 'Example: 30'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'عدد الأيام التي تريد عرض الإعلان فيها'
                      : 'Number of days you want to display the ad'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {language === 'ar' ? 'رسالة إضافية' : 'Additional Message'}
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'ar'
                      ? 'أي ملاحظات أو متطلبات خاصة (اختياري)'
                      : 'Any notes or special requirements (optional)'
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      {language === 'ar' ? 'ملاحظة حول التسعير' : 'Pricing Note'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'الأسعار تختلف حسب موقع الإعلان ومدة العرض. سيتم التواصل معك خلال 24 ساعة لتحديد السعر المناسب وإتمام الحجز.'
                        : 'Prices vary based on ad placement and duration. We will contact you within 24 hours to determine the appropriate price and complete the booking.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || !formData.placement}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </div>

      {/* Success Celebration */}
      <SuccessCelebration
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={language === 'ar' ? '🎉 مبروك!' : '🎉 Congratulations!'}
        message={language === 'ar'
          ? 'تم تقديم طلبك بنجاح! سيتم التواصل معك في أقرب وقت.'
          : 'Your request has been submitted successfully! We will contact you soon.'
        }
      />
    </div>
  );
}

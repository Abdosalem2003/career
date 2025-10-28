import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sunrise, Sun, Sunset, Moon, Star, Clock, MapPin, Calendar, RefreshCw, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdPlacement } from "@/components/ad-placement";
import { SpecialReports } from "@/components/special-reports";
import { MonthlyPrayerTable } from "@/components/monthly-prayer-table";
import { SmartPrayerTimes, PrayerTimesCache } from "@/lib/prayer-times-services";
import type { PrayerTimes, DateInfo } from "@/lib/prayer-times-services";
import { Button } from "@/components/ui/button";

const egyptCities = [
  { name: "القاهرة", nameEn: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "الإسكندرية", nameEn: "Alexandria", lat: 31.2001, lon: 29.9187 },
  { name: "الجيزة", nameEn: "Giza", lat: 30.0131, lon: 31.2089 },
  { name: "شبرا الخيمة", nameEn: "Shubra El-Kheima", lat: 30.1286, lon: 31.2422 },
  { name: "بورسعيد", nameEn: "Port Said", lat: 31.2653, lon: 32.3019 },
  { name: "السويس", nameEn: "Suez", lat: 29.9668, lon: 32.5498 },
  { name: "الأقصر", nameEn: "Luxor", lat: 25.6872, lon: 32.6396 },
  { name: "المنصورة", nameEn: "Mansoura", lat: 31.0409, lon: 31.3785 },
  { name: "طنطا", nameEn: "Tanta", lat: 30.7865, lon: 31.0004 },
  { name: "أسيوط", nameEn: "Asyut", lat: 27.1809, lon: 31.1837 },
  { name: "الإسماعيلية", nameEn: "Ismailia", lat: 30.5833, lon: 32.2667 },
  { name: "الفيوم", nameEn: "Faiyum", lat: 29.3084, lon: 30.8428 },
  { name: "الزقازيق", nameEn: "Zagazig", lat: 30.5877, lon: 31.5021 },
  { name: "أسوان", nameEn: "Aswan", lat: 24.0889, lon: 32.8998 },
  { name: "دمياط", nameEn: "Damietta", lat: 31.4175, lon: 31.8144 },
  { name: "دمنهور", nameEn: "Damanhur", lat: 31.0341, lon: 30.4682 },
  { name: "المنيا", nameEn: "Minya", lat: 28.0871, lon: 30.7618 },
  { name: "بني سويف", nameEn: "Beni Suef", lat: 29.0661, lon: 31.0994 },
  { name: "قنا", nameEn: "Qena", lat: 26.1551, lon: 32.7160 },
  { name: "سوهاج", nameEn: "Sohag", lat: 26.5569, lon: 31.6948 },
  { name: "كفر الشيخ", nameEn: "Kafr El Sheikh", lat: 31.1107, lon: 30.9388 },
  { name: "مرسى مطروح", nameEn: "Marsa Matruh", lat: 31.3543, lon: 27.2373 },
  { name: "الغردقة", nameEn: "Hurghada", lat: 27.2579, lon: 33.8116 },
  { name: "شرم الشيخ", nameEn: "Sharm El Sheikh", lat: 27.9158, lon: 34.3300 },
  { name: "6 أكتوبر", nameEn: "6th of October", lat: 29.9533, lon: 30.9167 },
  { name: "العاشر من رمضان", nameEn: "10th of Ramadan", lat: 30.3089, lon: 31.7430 },
  { name: "الشرقية", nameEn: "Sharqia", lat: 30.5877, lon: 31.5021 },
  { name: "القليوبية", nameEn: "Qalyubia", lat: 30.1792, lon: 31.2056 },
  { name: "البحيرة", nameEn: "Beheira", lat: 30.8481, lon: 30.3436 },
  { name: "الدقهلية", nameEn: "Dakahlia", lat: 31.0409, lon: 31.3785 },
  { name: "الغربية", nameEn: "Gharbia", lat: 30.7865, lon: 31.0004 },
  { name: "المنوفية", nameEn: "Monufia", lat: 30.5972, lon: 30.9876 },
  { name: "شمال سيناء", nameEn: "North Sinai", lat: 31.1217, lon: 33.8011 },
  { name: "جنوب سيناء", nameEn: "South Sinai", lat: 29.3117, lon: 34.8441 },
  { name: "البحر الأحمر", nameEn: "Red Sea", lat: 27.2579, lon: 33.8116 },
  { name: "الوادي الجديد", nameEn: "New Valley", lat: 25.4521, lon: 28.9864 },
  { name: "مطروح", nameEn: "Matrouh", lat: 31.3543, lon: 27.2373 },
];

export default function PrayerTimesPage() {
  const { language } = useI18n();
  const [selectedCity, setSelectedCity] = useState(egyptCities[0]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [apiSource, setApiSource] = useState<string>("");

  // Convert English month to Arabic
  const getArabicMonth = (monthEn: string) => {
    const months: Record<string, string> = {
      'January': 'يناير',
      'February': 'فبراير',
      'March': 'مارس',
      'April': 'أبريل',
      'May': 'مايو',
      'June': 'يونيو',
      'July': 'يوليو',
      'August': 'أغسطس',
      'September': 'سبتمبر',
      'October': 'أكتوبر',
      'November': 'نوفمبر',
      'December': 'ديسمبر'
    };
    return months[monthEn] || monthEn;
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [selectedCity]);

  useEffect(() => {
    if (prayerTimes) {
      const interval = setInterval(() => {
        calculateNextPrayer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
    setLoading(true);
    try {
      // تحقق من الكاش أولاً
      const cached = PrayerTimesCache.get(selectedCity.lat, selectedCity.lon);
      if (cached) {
        setPrayerTimes(cached.times);
        setDateInfo(cached.date);
        setApiSource(cached.source + " (مخزن)");
        setLoading(false);
        return;
      }

      // استخدم النظام الذكي مع Fallback تلقائي
      const result = await SmartPrayerTimes.getPrayerTimes(selectedCity.lat, selectedCity.lon);
      
      if (result) {
        setPrayerTimes(result.times);
        setDateInfo(result.date);
        setApiSource(result.source);
        
        // احفظ في الكاش
        PrayerTimesCache.set(selectedCity.lat, selectedCity.lon, result);
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      // في حالة الفشل الكامل، سيتم استخدام الأوقات الافتراضية من SmartPrayerTimes
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: language === "ar" ? "الفجر" : "Fajr", time: prayerTimes.Fajr },
      { name: language === "ar" ? "الشروق" : "Sunrise", time: prayerTimes.Sunrise },
      { name: language === "ar" ? "الظهر" : "Dhuhr", time: prayerTimes.Dhuhr },
      { name: language === "ar" ? "العصر" : "Asr", time: prayerTimes.Asr },
      { name: language === "ar" ? "المغرب" : "Maghrib", time: prayerTimes.Maghrib },
      { name: language === "ar" ? "العشاء" : "Isha", time: prayerTimes.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        const diff = prayerTime - currentTime;
        const hoursLeft = Math.floor(diff / 60);
        const minutesLeft = diff % 60;
        
        setNextPrayer({
          name: prayer.name,
          time: prayer.time,
          remaining: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}`,
        });
        return;
      }
    }

    // If no prayer found today, next is Fajr tomorrow
    const [hours, minutes] = prayerTimes.Fajr.split(":").map(Number);
    const fajrTime = hours * 60 + minutes;
    const diff = (24 * 60 - currentTime) + fajrTime;
    const hoursLeft = Math.floor(diff / 60);
    const minutesLeft = diff % 60;

    setNextPrayer({
      name: language === "ar" ? "الفجر" : "Fajr",
      time: prayerTimes.Fajr,
      remaining: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}`,
    });
  };

  // Convert 24h to 12h format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? (language === "ar" ? "م" : "PM") : (language === "ar" ? "ص" : "AM");
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const prayerData = [
    { name: language === "ar" ? "الفجر" : "Fajr", nameEn: "Fajr", time: prayerTimes?.Fajr ? convertTo12Hour(prayerTimes.Fajr) : "", icon: Star, color: "from-indigo-500 to-purple-600" },
    { name: language === "ar" ? "الشروق" : "Sunrise", nameEn: "Sunrise", time: prayerTimes?.Sunrise ? convertTo12Hour(prayerTimes.Sunrise) : "", icon: Sunrise, color: "from-orange-400 to-yellow-500" },
    { name: language === "ar" ? "الظهر" : "Dhuhr", nameEn: "Dhuhr", time: prayerTimes?.Dhuhr ? convertTo12Hour(prayerTimes.Dhuhr) : "", icon: Sun, color: "from-yellow-400 to-orange-500" },
    { name: language === "ar" ? "العصر" : "Asr", nameEn: "Asr", time: prayerTimes?.Asr ? convertTo12Hour(prayerTimes.Asr) : "", icon: Sun, color: "from-amber-500 to-orange-600" },
    { name: language === "ar" ? "المغرب" : "Maghrib", nameEn: "Maghrib", time: prayerTimes?.Maghrib ? convertTo12Hour(prayerTimes.Maghrib) : "", icon: Sunset, color: "from-red-500 to-pink-600" },
    { name: language === "ar" ? "العشاء" : "Isha", nameEn: "Isha", time: prayerTimes?.Isha ? convertTo12Hour(prayerTimes.Isha) : "", icon: Moon, color: "from-blue-600 to-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        {/* Header - Compact */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Moon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-['Cairo']">
              {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-['Cairo']">
            {language === "ar" ? "دليلك اليومي لأوقات الصلاة في محافظات مصر" : "Your daily guide to prayer times in Egypt"}
          </p>
        </div>

        {/* City Selector & Dates - Simplified */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1 font-['Cairo']">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
                {language === "ar" ? "المحافظة" : "City"}
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedCity.nameEn}
                  onValueChange={(value) => {
                    const city = egyptCities.find((c) => c.nameEn === value);
                    if (city) setSelectedCity(city);
                  }}
                >
                  <SelectTrigger className="w-full h-10 font-['Cairo'] border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 dark:bg-gray-800 dark:border-gray-700">
                    {egyptCities.map((city) => (
                      <SelectItem key={city.nameEn} value={city.nameEn} className="font-['Cairo']">
                        {language === "ar" ? city.name : city.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={fetchPrayerTimes}
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {apiSource && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {apiSource}
                </p>
              )}
            </div>

            {/* Hijri Date */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1 font-['Cairo']">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                {language === "ar" ? "التاريخ الهجري" : "Hijri Date"}
              </label>
              {dateInfo && (
                <p className="text-base font-bold text-gray-900 dark:text-white font-['Cairo'] bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-center">
                  {dateInfo.hijri.day} {language === "ar" ? dateInfo.hijri.month.ar : dateInfo.hijri.month.en} {dateInfo.hijri.year}
                </p>
              )}
            </div>

            {/* Gregorian Date */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1 font-['Cairo']">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                {language === "ar" ? "التاريخ الميلادي" : "Gregorian Date"}
              </label>
              {dateInfo && (
                <p className="text-base font-bold text-gray-900 dark:text-white font-['Cairo'] bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 text-center">
                  {language === "ar" 
                    ? `${dateInfo.gregorian.day} ${getArabicMonth(dateInfo.gregorian.month.en)} ${dateInfo.gregorian.year}`
                    : `${dateInfo.gregorian.day} ${dateInfo.gregorian.month.en} ${dateInfo.gregorian.year}`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Prayer Alert - Simplified */}
        {nextPrayer && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 mb-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 animate-pulse" />
                <div>
                  <p className="text-xs opacity-90 font-['Cairo']">
                    {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
                  </p>
                  <p className="text-2xl font-black font-['Cairo']">
                    {nextPrayer.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90 font-['Cairo']">
                  {language === "ar" ? "الوقت المتبقي" : "Time Left"}
                </p>
                <p className="text-3xl font-black font-mono">
                  {nextPrayer.remaining}
                </p>
                <p className="text-sm font-['Cairo'] mt-0.5 opacity-90">
                  {convertTo12Hour(nextPrayer.time)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-['Cairo']">
              {language === "ar" ? "جاري تحميل مواقيت الصلاة..." : "Loading prayer times..."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {prayerData.map((prayer, index) => {
                const Icon = prayer.icon;
                const isNext = nextPrayer?.name === prayer.name;
                
                return (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all p-4 ${
                      isNext ? "ring-2 ring-green-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${prayer.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {isNext && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-['Cairo']">
                          {language === "ar" ? "القادمة" : "Next"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 font-['Cairo']">
                      {prayer.name}
                    </h3>
                    <p className="text-2xl font-black text-gray-900 dark:text-white font-['Cairo']">
                      {prayer.time}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Monthly Prayer Times Table */}
            <div className="mb-8">
              <MonthlyPrayerTable city={selectedCity} />
            </div>
          </>
        )}

        {/* Special Reports Section */}
        <div className="my-12">
          <SpecialReports />
        </div>

        {/* Footer Ad */}
        <AdPlacement placement="footer" className="mt-12" />

        {/* Footer Info - Simplified */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-['Cairo']">
            {language === "ar" 
              ? "مواقيت الصلاة محسوبة وفقاً لطريقة الهيئة المصرية العامة للمساحة • البيانات من AlAdhan API"
              : "Prayer times calculated according to Egyptian General Survey Authority • Data from AlAdhan API"}
          </p>
        </div>
      </div>
    </div>
  );
}

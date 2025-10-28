import { useState, useEffect, useMemo, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartPrayerTimes } from "@/lib/prayer-times-services";

interface DayPrayerTimes {
  date: string;
  day: string;
  hijriDate: string;
  dayName: string;
  dayNameAr: string;
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

interface MonthlyPrayerTableProps {
  city: { name: string; nameEn: string; lat: number; lon: number };
}

export function MonthlyPrayerTable({ city }: MonthlyPrayerTableProps) {
  const { language } = useI18n();
  const [monthlyData, setMonthlyData] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [highlightToday, setHighlightToday] = useState(true);
  const todayRowRef = useRef<HTMLTableRowElement>(null);

  const arabicDays = useMemo(() => ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], []);
  const englishDays = useMemo(() => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], []);

  const arabicMonths = useMemo(() => [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ], []);

  useEffect(() => {
    fetchMonthlyPrayerTimes();
  }, [city]);

  // التمرير التلقائي لليوم الحالي بعد تحميل البيانات
  useEffect(() => {
    if (!loading && todayRowRef.current) {
      setTimeout(() => {
        todayRowRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [loading, monthlyData]);

  const fetchMonthlyPrayerTimes = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      setCurrentMonth(language === "ar" ? arabicMonths[month - 1] : now.toLocaleString('en-US', { month: 'long' }));
      setCurrentYear(year.toString());

      // استخدام النظام الذكي مع Fallback تلقائي
      const monthlyData = await SmartPrayerTimes.getMonthlyTimes(city.lat, city.lon, month, year);
      
      if (!monthlyData || monthlyData.length === 0) {
        throw new Error('Failed to fetch monthly prayer times');
      }
      
      const data = { code: 200, data: monthlyData };
      
      if (data.code === 200 && data.data && Array.isArray(data.data)) {
        const formattedData: DayPrayerTimes[] = data.data.map((day: any, index: number) => {
          // استخدام التاريخ الميلادي من API مباشرة
          const gregorianDay = day.date.gregorian.day;
          const gregorianMonth = day.date.gregorian.month.number;
          const gregorianYear = day.date.gregorian.year;
          
          // إنشاء كائن تاريخ صحيح
          const dateObj = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);
          const dayIndex = dateObj.getDay();
          
          return {
            date: `${gregorianDay}`,
            day: `${gregorianDay}`,
            hijriDate: `${day.date.hijri.day} ${day.date.hijri.month.ar}`,
            dayName: englishDays[dayIndex],
            dayNameAr: arabicDays[dayIndex],
            timings: {
              Fajr: day.timings.Fajr.split(' ')[0].substring(0, 5),
              Sunrise: day.timings.Sunrise.split(' ')[0].substring(0, 5),
              Dhuhr: day.timings.Dhuhr.split(' ')[0].substring(0, 5),
              Asr: day.timings.Asr.split(' ')[0].substring(0, 5),
              Maghrib: day.timings.Maghrib.split(' ')[0].substring(0, 5),
              Isha: day.timings.Isha.split(' ')[0].substring(0, 5),
            }
          };
        });
        
        setMonthlyData(formattedData);
        setError(null);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error("Error fetching monthly prayer times:", error);
      setError(language === "ar" 
        ? "حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى."
        : "Error loading data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // تحويل الوقت من 24 ساعة إلى 12 ساعة
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? (language === "ar" ? "م" : "PM") : (language === "ar" ? "ص" : "AM");
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  // التحقق من اليوم الحالي
  const isToday = (day: string) => {
    const now = new Date();
    const today = now.getDate();
    const currentMonthNum = now.getMonth() + 1;
    const currentYearNum = now.getFullYear();
    
    // التأكد من أننا في نفس الشهر والسنة
    return parseInt(day) === today && 
           currentMonth === (language === "ar" ? arabicMonths[currentMonthNum - 1] : now.toLocaleString('en-US', { month: 'long' })) &&
           currentYear === currentYearNum.toString();
  };

  // تصدير الجدول كـ CSV
  const exportToCSV = () => {
    const headers = language === "ar" 
      ? ["اليوم", "التاريخ الهجري", "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"]
      : ["Day", "Hijri Date", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    const rows = monthlyData.map(day => [
      language === "ar" ? `${day.dayNameAr} ${day.day} ${currentMonth}` : `${day.dayName} ${day.day} ${currentMonth}`,
      day.hijriDate,
      convertTo12Hour(day.timings.Fajr),
      convertTo12Hour(day.timings.Sunrise),
      convertTo12Hour(day.timings.Dhuhr),
      convertTo12Hour(day.timings.Asr),
      convertTo12Hour(day.timings.Maghrib),
      convertTo12Hour(day.timings.Isha),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prayer-times-${currentMonth}-${currentYear}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card className="w-full shadow-xl border-0">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-['Cairo']">
              {language === "ar" ? "جاري تحميل جدول المواقيت الشهري..." : "Loading monthly prayer times..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-xl border-0 border-red-200">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-['Cairo'] mb-4 text-lg font-semibold">
              {error}
            </p>
            <Button
              onClick={() => fetchMonthlyPrayerTimes(true)}
              variant="outline"
              className="font-['Cairo'] border-red-600 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === "ar" ? "إعادة المحاولة" : "Try Again"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-4 md:pb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-2xl font-bold font-['Cairo'] mb-0.5 md:mb-1">
                {language === "ar" ? "جدول مواقيت الصلاة الشهري" : "Monthly Prayer Times Table"}
              </CardTitle>
              <p className="text-xs md:text-sm text-white/90 font-['Cairo']">
                {language === "ar" 
                  ? `${currentMonth} ${currentYear} - ${city.name}`
                  : `${currentMonth} ${currentYear} - ${city.nameEn}`
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => fetchMonthlyPrayerTimes(true)}
              variant="secondary"
              size="sm"
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-['Cairo'] flex-1 sm:flex-none"
            >
              <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${language === "ar" ? "ml-1.5" : "mr-1.5"} ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-xs md:text-sm">{language === "ar" ? "تحديث" : "Refresh"}</span>
            </Button>
            <Button
              onClick={exportToCSV}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-['Cairo'] flex-1 sm:flex-none"
            >
              <Download className={`h-3.5 w-3.5 md:h-4 md:w-4 ${language === "ar" ? "ml-1.5" : "mr-1.5"}`} />
              <span className="text-xs md:text-sm">{language === "ar" ? "تصدير" : "Export"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* ملاحظة التمرير للشاشات الصغيرة */}
        <div className="md:hidden bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-['Cairo'] text-center">
            {language === "ar" 
              ? "← مرر لليسار لعرض جميع الأعمدة"
              : "Swipe left to view all columns →"
            }
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-200">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b-2 border-green-600">
                <th className="px-3 py-3 text-center font-bold text-gray-900 dark:text-white font-['Cairo'] text-xs md:text-sm sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700 min-w-[120px]">
                  {language === "ar" ? "اليوم" : "Day"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-indigo-700 dark:text-indigo-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "الفجر" : "Fajr"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-orange-600 dark:text-orange-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "الشروق" : "Sunrise"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-yellow-600 dark:text-yellow-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "الظهر" : "Dhuhr"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-amber-600 dark:text-amber-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "العصر" : "Asr"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-red-600 dark:text-red-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "المغرب" : "Maghrib"}
                </th>
                <th className="px-3 py-3 text-center font-bold text-blue-700 dark:text-blue-400 font-['Cairo'] text-xs md:text-sm min-w-[90px]">
                  {language === "ar" ? "العشاء" : "Isha"}
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((day, index) => {
                const today = isToday(day.day);
                const isFriday = day.dayNameAr === "الجمعة";
                
                return (
                  <tr
                    key={index}
                    ref={today ? todayRowRef : null}
                    className={`
                      border-b border-gray-100 dark:border-gray-700 transition-colors
                      ${today ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-600' : ''}
                      ${isFriday && !today ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                      ${!today && !isFriday ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                    `}
                  >
                    <td className="px-3 py-2.5 text-center sticky left-0 bg-inherit z-10 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-xs md:text-sm font-bold font-['Cairo'] ${today ? 'text-green-700 dark:text-green-400' : isFriday ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {language === "ar" ? day.dayNameAr : day.dayName}
                        </span>
                        <span className={`text-[10px] md:text-xs font-['Cairo'] ${today ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                          {day.day} {currentMonth}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-['Cairo']">
                          {day.hijriDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Fajr)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Sunrise)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Dhuhr)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Asr)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Maghrib)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs md:text-sm font-semibold font-['Cairo'] whitespace-nowrap ${today ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {convertTo12Hour(day.timings.Isha)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-t-2 border-green-600/20">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 font-['Cairo']">
                  {language === "ar" ? "اليوم الحالي" : "Today"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 font-['Cairo']">
                  {language === "ar" ? "يوم الجمعة" : "Friday"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 font-['Cairo']">
                {language === "ar" 
                  ? `إجمالي ${monthlyData.length} يوم`
                  : `Total ${monthlyData.length} days`
                }
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-['Cairo'] text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            {language === "ar" 
              ? "⏱️ جميع الأوقات محسوبة وفقاً للتوقيت المحلي • البيانات محدثة فورياً من AlAdhan API"
              : "⏱️ All times calculated according to local timezone • Data updated instantly from AlAdhan API"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

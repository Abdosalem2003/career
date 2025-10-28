import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { Link } from "wouter";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function PrayerTimesWidget() {
  const { language } = useI18n();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [city] = useState({ name: "القاهرة", nameEn: "Cairo", lat: 30.0444, lon: 31.2357 });

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      const interval = setInterval(() => {
        calculateNextPrayer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lon}&method=5`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const calculateNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: language === "ar" ? "الفجر" : "Fajr", time: prayerTimes.Fajr },
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

    // Next is Fajr tomorrow
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

  if (!nextPrayer) return null;

  return (
    <Link href="/prayer-times">
      <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-green-100 dark:border-green-900 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white font-['Cairo']">
            <Clock className="h-4 w-4 text-green-600" />
            {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <p className="text-2xl font-black text-green-600 dark:text-green-400 font-['Cairo']">
              {nextPrayer.name}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-['Cairo'] mt-1">
              {convertTo12Hour(nextPrayer.time)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-['Cairo']">
              {language === "ar" ? "الوقت المتبقي" : "Time Left"}
            </p>
            <p className="text-2xl font-black text-green-600 dark:text-green-400 font-mono">
              {nextPrayer.remaining}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-['Cairo']">
            <MapPin className="h-3 w-3" />
            <span>{language === "ar" ? city.name : city.nameEn}</span>
          </div>

          <p className="text-xs text-center text-green-600 dark:text-green-400 font-semibold font-['Cairo']">
            {language === "ar" ? "اضغط لعرض جميع المواقيت" : "Click for all times"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

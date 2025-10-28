import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerContextType {
  prayerTimes: PrayerTimes | null;
  nextPrayer: { name: string; nameAr: string; time: string } | null;
  timeRemaining: string;
  selectedCity: { name: string; nameEn: string; lat: number; lon: number };
  setSelectedCity: (city: { name: string; nameEn: string; lat: number; lon: number }) => void;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export function PrayerProvider({ children }: { children: ReactNode }) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; nameAr: string; time: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [selectedCity, setSelectedCity] = useState({
    name: "القاهرة",
    nameEn: "Cairo",
    lat: 30.0444,
    lon: 31.2357,
  });

  // جلب أوقات الصلاة
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&method=5`
        );
        const data = await response.json();

        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  // تحديث الصلاة القادمة والوقت المتبقي
  useEffect(() => {
    const updateNextPrayer = () => {
      if (!prayerTimes) return;

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const prayers = [
        { name: "Fajr", nameAr: "الفجر", time: prayerTimes.Fajr },
        { name: "Dhuhr", nameAr: "الظهر", time: prayerTimes.Dhuhr },
        { name: "Asr", nameAr: "العصر", time: prayerTimes.Asr },
        { name: "Maghrib", nameAr: "المغرب", time: prayerTimes.Maghrib },
        { name: "Isha", nameAr: "العشاء", time: prayerTimes.Isha },
      ];

      let found = false;
      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const prayerTime = hours * 60 + minutes;

        if (prayerTime > currentTime) {
          setNextPrayer(prayer);
          found = true;

          // حساب الوقت المتبقي
          const diff = prayerTime - currentTime;
          const hoursLeft = Math.floor(diff / 60);
          const minutesLeft = diff % 60;
          const secondsLeft = Math.floor((diff % 1) * 60);

          setTimeRemaining(`${hoursLeft}س ${minutesLeft}د ${secondsLeft}ث`);
          break;
        }
      }

      // إذا لم نجد صلاة قادمة، الصلاة القادمة هي الفجر غداً
      if (!found) {
        setNextPrayer({ name: "Fajr", nameAr: "الفجر", time: prayerTimes.Fajr });
        const [hours, minutes] = prayerTimes.Fajr.split(":").map(Number);
        const fajrTime = hours * 60 + minutes;
        const diff = (24 * 60 - currentTime) + fajrTime;
        const hoursLeft = Math.floor(diff / 60);
        const minutesLeft = diff % 60;

        setTimeRemaining(`${hoursLeft}س ${minutesLeft}د 0ث`);
      }
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return (
    <PrayerContext.Provider
      value={{
        prayerTimes,
        nextPrayer,
        timeRemaining,
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error("usePrayer must be used within PrayerProvider");
  }
  return context;
}

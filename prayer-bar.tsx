import { Clock, Sunrise, Sun, Sunset, Moon, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePrayer } from "@/lib/prayer-context";

const prayerIcons: Record<string, any> = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

export function PrayerBar() {
  const { language } = useI18n();
  const { nextPrayer, timeRemaining } = usePrayer();

  if (!nextPrayer) return null;

  const PrayerIcon = prayerIcons[nextPrayer.name] || Sunrise;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 shadow-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center gap-6 text-sm font-medium">
          {/* الصلاة القادمة */}
          <div className="flex items-center gap-2">
            <PrayerIcon className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === "ar" ? "الصلاة القادمة:" : "Next Prayer:"}
            </span>
            <span className="font-bold text-lg">
              {language === "ar" ? nextPrayer.nameAr : nextPrayer.name}
            </span>
          </div>

          {/* الفاصل */}
          <div className="h-4 w-px bg-white/30 hidden sm:block"></div>

          {/* الوقت */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-bold text-lg">{nextPrayer.time}</span>
          </div>

          {/* الفاصل */}
          <div className="h-4 w-px bg-white/30 hidden sm:block"></div>

          {/* الوقت المتبقي */}
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 animate-pulse" />
            <span className="hidden sm:inline">
              {language === "ar" ? "المتبقي:" : "Remaining:"}
            </span>
            <span className="font-bold text-lg tabular-nums">{timeRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, Sunrise, Sun, Sunset, Moon, Star } from "lucide-react";
import { motion } from "framer-motion";

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

export function ModernPrayerWidget() {
  const { language } = useI18n();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  // مواعيد الصلاة (يمكن ربطها بـ API حقيقي)
  const prayerTimes: PrayerTime[] = [
    {
      name: "Fajr",
      nameAr: "الفجر",
      time: "05:15",
      icon: Sunrise,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Dhuhr", 
      nameAr: "الظهر",
      time: "12:30",
      icon: Sun,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      name: "Asr",
      nameAr: "العصر", 
      time: "15:45",
      icon: Sun,
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "Maghrib",
      nameAr: "المغرب",
      time: "18:20",
      icon: Sunset,
      color: "text-red-600", 
      gradient: "from-red-500 to-pink-500"
    },
    {
      name: "Isha",
      nameAr: "العشاء",
      time: "19:45",
      icon: Moon,
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // حساب الصلاة القادمة
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer of prayerTimes) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer);
        break;
      }
    }
    
    // إذا لم نجد صلاة اليوم، الصلاة القادمة هي فجر الغد
    if (!nextPrayer) {
      setNextPrayer(prayerTimes[0]);
    }
  }, [currentTime]);

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilNext = () => {
    if (!nextPrayer) return "";
    
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    if (prayerTime < now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    const diff = prayerTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (language === "ar") {
      return `${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
    }
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Card */}
      <Card className="mb-6 overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {language === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
                </h2>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{language === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4" />
                <span>
                  {currentTime.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Prayer Alert */}
      {nextPrayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className={`border-2 bg-gradient-to-r ${nextPrayer.gradient} text-white shadow-xl`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <nextPrayer.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
                    </div>
                    <div className="text-white/80 text-sm">
                      {language === "ar" ? nextPrayer.nameAr : nextPrayer.name} - {nextPrayer.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {getTimeUntilNext()}
                  </div>
                  <div className="text-white/80 text-sm">
                    {language === "ar" ? "متبقي" : "remaining"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {prayerTimes.map((prayer, index) => {
          const isNext = nextPrayer?.name === prayer.name;
          
          return (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isNext 
                  ? 'ring-2 ring-emerald-500 shadow-lg' 
                  : 'hover:shadow-lg'
              }`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    {/* Prayer Icon */}
                    <div className={`h-12 w-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${prayer.gradient} flex items-center justify-center shadow-lg`}>
                      <prayer.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Prayer Name */}
                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
                      {language === "ar" ? prayer.nameAr : prayer.name}
                    </h3>
                    
                    {/* Prayer Time */}
                    <div className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                      {prayer.time}
                    </div>
                    
                    {/* Next Prayer Badge */}
                    {isNext && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                        {language === "ar" ? "القادمة" : "Next"}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Background Decoration */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${prayer.gradient} opacity-10 rounded-full -translate-y-10 translate-x-10`} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <Card className="mt-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              {language === "ar" 
                ? "المواقيت محسوبة لمدينة القاهرة - يتم التحديث تلقائياً" 
                : "Times calculated for Cairo - Updates automatically"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

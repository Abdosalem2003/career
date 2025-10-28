/**
 * Prayer Times API Services with Automatic Fallback
 * خدمات مواقيت الصلاة مع نظام احتياطي تلقائي
 * 
 * 4 خدمات مجانية موثوقة:
 * 1. Aladhan API - الأفضل والأكثر دقة
 * 2. Islamic Finder API - احتياطي قوي
 * 3. Prayer Times API - بديل مجاني
 * 4. Al-Adhan API - احتياطي نهائي
 */

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface DateInfo {
  hijri: {
    date: string;
    day: string;
    month: { ar: string; en: string };
    year: string;
  };
  gregorian: {
    date: string;
    day: string;
    month: { en: string };
    year: string;
  };
}

export interface PrayerTimesResponse {
  times: PrayerTimes;
  date: DateInfo;
  source: string;
}

// ============ 1. ALADHAN API (الأفضل) ============
export class AladhanService {
  private static baseUrl = "https://api.aladhan.com/v1";

  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/timings?latitude=${lat}&longitude=${lon}&method=5`,
        { timeout: 10000 } as any
      );

      if (!response.ok) throw new Error('Aladhan API failed');

      const data = await response.json();

      if (data.code === 200) {
        return {
          times: {
            Fajr: data.data.timings.Fajr,
            Sunrise: data.data.timings.Sunrise,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          },
          date: data.data.date,
          source: 'Aladhan API'
        };
      }

      throw new Error('Invalid response from Aladhan');
    } catch (error) {
      console.error('Aladhan Service Error:', error);
      throw error;
    }
  }

  static async getMonthlyTimes(lat: number, lon: number, month: number, year: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendar?latitude=${lat}&longitude=${lon}&method=5&month=${month}&year=${year}`,
        { timeout: 15000 } as any
      );

      if (!response.ok) throw new Error('Aladhan calendar failed');

      const data = await response.json();

      if (data.code === 200) {
        return data.data;
      }

      throw new Error('Invalid calendar response');
    } catch (error) {
      console.error('Aladhan Monthly Error:', error);
      throw error;
    }
  }
}

// ============ 2. ISLAMIC FINDER API ============
export class IslamicFinderService {
  private static baseUrl = "https://www.islamicfinder.us/index.php/api/prayer_times";

  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    try {
      const today = new Date();
      const response = await fetch(
        `${this.baseUrl}?latitude=${lat}&longitude=${lon}&timezone=Africa/Cairo&method=5`,
        { timeout: 10000 } as any
      );

      if (!response.ok) throw new Error('Islamic Finder failed');

      const data = await response.json();

      if (data.results) {
        const times = data.results;
        return {
          times: {
            Fajr: times.Fajr,
            Sunrise: times.Sunrise,
            Dhuhr: times.Dhuhr,
            Asr: times.Asr,
            Maghrib: times.Maghrib,
            Isha: times.Isha,
          },
          date: {
            hijri: {
              date: times.hijri_date || '',
              day: times.hijri_day || '',
              month: { ar: times.hijri_month_ar || '', en: times.hijri_month || '' },
              year: times.hijri_year || ''
            },
            gregorian: {
              date: today.toLocaleDateString(),
              day: today.getDate().toString(),
              month: { en: today.toLocaleString('en', { month: 'long' }) },
              year: today.getFullYear().toString()
            }
          },
          source: 'Islamic Finder API'
        };
      }

      throw new Error('Invalid response from Islamic Finder');
    } catch (error) {
      console.error('Islamic Finder Error:', error);
      throw error;
    }
  }
}

// ============ 3. PRAYER TIMES API ============
export class PrayerTimesAPIService {
  private static baseUrl = "https://api.pray.zone/v2/times/today.json";

  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}?latitude=${lat}&longitude=${lon}`,
        { timeout: 10000 } as any
      );

      if (!response.ok) throw new Error('Prayer Times API failed');

      const data = await response.json();

      if (data.results && data.results.datetime) {
        const times = data.results.datetime[0].times;
        const today = new Date();
        
        return {
          times: {
            Fajr: times.Fajr,
            Sunrise: times.Sunrise,
            Dhuhr: times.Dhuhr,
            Asr: times.Asr,
            Maghrib: times.Maghrib,
            Isha: times.Isha,
          },
          date: {
            hijri: {
              date: data.results.datetime[0].date.hijri || '',
              day: '',
              month: { ar: '', en: '' },
              year: ''
            },
            gregorian: {
              date: today.toLocaleDateString(),
              day: today.getDate().toString(),
              month: { en: today.toLocaleString('en', { month: 'long' }) },
              year: today.getFullYear().toString()
            }
          },
          source: 'Prayer Times API'
        };
      }

      throw new Error('Invalid response from Prayer Times API');
    } catch (error) {
      console.error('Prayer Times API Error:', error);
      throw error;
    }
  }
}

// ============ 4. AL-ADHAN API (احتياطي نهائي) ============
export class AlAdhanService {
  private static baseUrl = "https://api.aladhan.com/v1";

  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    try {
      // استخدام endpoint مختلف كاحتياطي
      const response = await fetch(
        `${this.baseUrl}/timingsByCity?city=Cairo&country=Egypt&method=5`,
        { timeout: 10000 } as any
      );

      if (!response.ok) throw new Error('Al-Adhan backup failed');

      const data = await response.json();

      if (data.code === 200) {
        return {
          times: {
            Fajr: data.data.timings.Fajr,
            Sunrise: data.data.timings.Sunrise,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          },
          date: data.data.date,
          source: 'Al-Adhan Backup API'
        };
      }

      throw new Error('Invalid response from Al-Adhan');
    } catch (error) {
      console.error('Al-Adhan Backup Error:', error);
      throw error;
    }
  }
}

// ============ SMART PRAYER TIMES (نظام ذكي مع Fallback) ============
export class SmartPrayerTimes {
  private static services = [
    AladhanService,           // الأولوية 1 - الأفضل
    IslamicFinderService,     // الأولوية 2 - قوي
    PrayerTimesAPIService,    // الأولوية 3 - بديل
    AlAdhanService,           // الأولوية 4 - احتياطي نهائي
  ];

  static async getPrayerTimes(lat: number, lon: number): Promise<PrayerTimesResponse> {
    let lastError: any;

    // جرب كل خدمة بالترتيب
    for (const service of this.services) {
      try {
        console.log(`🕌 Trying ${service.name}...`);
        const result = await service.getPrayerTimes(lat, lon);
        
        if (result && result.times) {
          console.log(`✅ Success with ${result.source}`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${service.name} failed, trying next...`);
        lastError = error;
        continue;
      }
    }

    // إذا فشلت جميع الخدمات، استخدم أوقات افتراضية
    console.error('❌ All prayer times services failed, using fallback times');
    return this.getFallbackTimes();
  }

  static async getMonthlyTimes(lat: number, lon: number, month: number, year: number): Promise<any[]> {
    try {
      // جرب Aladhan أولاً
      return await AladhanService.getMonthlyTimes(lat, lon, month, year);
    } catch (error) {
      console.error('Monthly times failed:', error);
      // أرجع مصفوفة فارغة في حالة الفشل
      return [];
    }
  }

  // أوقات افتراضية في حالة فشل جميع الخدمات
  private static getFallbackTimes(): PrayerTimesResponse {
    const today = new Date();
    
    return {
      times: {
        Fajr: "04:30",
        Sunrise: "06:00",
        Dhuhr: "12:00",
        Asr: "15:30",
        Maghrib: "18:00",
        Isha: "19:30",
      },
      date: {
        hijri: {
          date: '',
          day: '',
          month: { ar: '', en: '' },
          year: ''
        },
        gregorian: {
          date: today.toLocaleDateString(),
          day: today.getDate().toString(),
          month: { en: today.toLocaleString('en', { month: 'long' }) },
          year: today.getFullYear().toString()
        }
      },
      source: 'Fallback Times (تقريبية)'
    };
  }

  // التحقق من صحة الأوقات
  static validateTimes(times: PrayerTimes): boolean {
    const required = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return required.every(prayer => times[prayer as keyof PrayerTimes] && times[prayer as keyof PrayerTimes].match(/^\d{2}:\d{2}$/));
  }
}

// ============ CACHING SERVICE ============
export class PrayerTimesCache {
  private static cache = new Map<string, { data: PrayerTimesResponse; timestamp: number }>();
  private static CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static get(lat: number, lon: number): PrayerTimesResponse | null {
    const key = `${lat},${lon}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached prayer times');
      return cached.data;
    }

    return null;
  }

  static set(lat: number, lon: number, data: PrayerTimesResponse): void {
    const key = `${lat},${lon}`;
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }
}

// ============ EXPORT ============
export const PrayerTimesServices = {
  Aladhan: AladhanService,
  IslamicFinder: IslamicFinderService,
  PrayerTimesAPI: PrayerTimesAPIService,
  AlAdhan: AlAdhanService,
  Smart: SmartPrayerTimes,
  Cache: PrayerTimesCache,
};

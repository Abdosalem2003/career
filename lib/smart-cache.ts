/**
 * Smart Caching System
 * نظام تخزين مؤقت ذكي لتحسين الأداء
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class SmartCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
  };

  /**
   * حفظ بيانات في الكاش
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    // إذا وصل الكاش للحد الأقصى، احذف الأقدم
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });

    this.stats.sets++;
  }

  /**
   * جلب بيانات من الكاش
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // تحقق من انتهاء الصلاحية
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // زيادة عداد الاستخدام
    item.hits++;
    this.stats.hits++;
    
    return item.data;
  }

  /**
   * حذف عنصر من الكاش
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * مسح الكاش بالكامل
   */
  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  /**
   * حذف العناصر المنتهية الصلاحية
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    
    return keysToDelete.length;
  }

  /**
   * حذف الأقدم (LRU - Least Recently Used)
   */
  private evictOldest() {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let lowestHits = Infinity;

    this.cache.forEach((item, key) => {
      // أولوية للأقل استخداماً
      if (item.hits < lowestHits) {
        lowestHits = item.hits;
        oldestKey = key;
        oldestTime = item.timestamp;
      } else if (item.hits === lowestHits && item.timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = item.timestamp;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * تحقق من وجود مفتاح
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // تحقق من الصلاحية
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// إنشاء instance واحد للاستخدام في كل التطبيق
export const cache = new SmartCache();

// تنظيف تلقائي كل 5 دقائق
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = cache.cleanup();
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired items`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Hook للاستخدام مع React Query
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // تحقق من الكاش أولاً
  const cached = cache.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  // إذا لم يكن موجود، اجلب البيانات
  return fetcher().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
}

export default cache;

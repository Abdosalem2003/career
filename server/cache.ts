import NodeCache from 'node-cache';
import { logDebug, logInfo } from './logger';

// إنشاء cache instances مختلفة لأنواع مختلفة من البيانات
class CacheManager {
  private shortCache: NodeCache;  // للبيانات التي تتغير بسرعة (5 دقائق)
  private mediumCache: NodeCache; // للبيانات المتوسطة (30 دقيقة)
  private longCache: NodeCache;   // للبيانات الثابتة (ساعة)

  constructor() {
    // Cache قصير المدى (5 دقائق)
    this.shortCache = new NodeCache({
      stdTTL: 300, // 5 دقائق
      checkperiod: 60, // فحص كل دقيقة
      useClones: false, // لتحسين الأداء
    });

    // Cache متوسط المدى (30 دقيقة)
    this.mediumCache = new NodeCache({
      stdTTL: 1800, // 30 دقيقة
      checkperiod: 120,
      useClones: false,
    });

    // Cache طويل المدى (ساعة)
    this.longCache = new NodeCache({
      stdTTL: 3600, // ساعة
      checkperiod: 300,
      useClones: false,
    });

    // تسجيل الأحداث
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const caches = [
      { name: 'short', cache: this.shortCache },
      { name: 'medium', cache: this.mediumCache },
      { name: 'long', cache: this.longCache }
    ];

    caches.forEach(({ name, cache }) => {
      cache.on('set', (key, value) => {
        logDebug(`Cache ${name}: Set key "${key}"`);
      });

      cache.on('del', (key, value) => {
        logDebug(`Cache ${name}: Deleted key "${key}"`);
      });

      cache.on('expired', (key, value) => {
        logDebug(`Cache ${name}: Expired key "${key}"`);
      });
    });
  }

  // ============================================
  // Short Cache Methods (5 minutes)
  // ============================================

  getShort<T>(key: string): T | undefined {
    return this.shortCache.get<T>(key);
  }

  setShort<T>(key: string, value: T, ttl?: number): boolean {
    return this.shortCache.set(key, value, ttl || 300);
  }

  deleteShort(key: string): number {
    return this.shortCache.del(key);
  }

  // ============================================
  // Medium Cache Methods (30 minutes)
  // ============================================

  getMedium<T>(key: string): T | undefined {
    return this.mediumCache.get<T>(key);
  }

  setMedium<T>(key: string, value: T, ttl?: number): boolean {
    return this.mediumCache.set(key, value, ttl || 1800);
  }

  deleteMedium(key: string): number {
    return this.mediumCache.del(key);
  }

  // ============================================
  // Long Cache Methods (1 hour)
  // ============================================

  getLong<T>(key: string): T | undefined {
    return this.longCache.get<T>(key);
  }

  setLong<T>(key: string, value: T, ttl?: number): boolean {
    return this.longCache.set(key, value, ttl || 3600);
  }

  deleteLong(key: string): number {
    return this.longCache.del(key);
  }

  // ============================================
  // Pattern-based Operations
  // ============================================

  deletePattern(pattern: string) {
    const regex = new RegExp(pattern);
    let deleted = 0;

    // حذف من جميع الـ caches
    [this.shortCache, this.mediumCache, this.longCache].forEach(cache => {
      const keys = cache.keys();
      keys.forEach(key => {
        if (regex.test(key)) {
          cache.del(key);
          deleted++;
        }
      });
    });

    logInfo(`Deleted ${deleted} cache entries matching pattern: ${pattern}`);
    return deleted;
  }

  // ============================================
  // Clear All
  // ============================================

  clearAll() {
    this.shortCache.flushAll();
    this.mediumCache.flushAll();
    this.longCache.flushAll();
    logInfo('All caches cleared');
  }

  // ============================================
  // Statistics
  // ============================================

  getStats() {
    return {
      short: this.shortCache.getStats(),
      medium: this.mediumCache.getStats(),
      long: this.longCache.getStats(),
    };
  }
}

// إنشاء instance واحد
export const cache = new CacheManager();

// ============================================
// Helper Functions
// ============================================

/**
 * Cache wrapper للدوال
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: 'short' | 'medium' | 'long' = 'medium'
): Promise<T> {
  // محاولة الحصول من الـ cache
  let cached: T | undefined;
  
  switch (duration) {
    case 'short':
      cached = cache.getShort<T>(key);
      break;
    case 'medium':
      cached = cache.getMedium<T>(key);
      break;
    case 'long':
      cached = cache.getLong<T>(key);
      break;
  }

  if (cached !== undefined) {
    logDebug(`Cache hit: ${key}`);
    return cached;
  }

  // إذا لم يكن موجود، جلب البيانات
  logDebug(`Cache miss: ${key}`);
  const data = await fetchFn();

  // حفظ في الـ cache
  switch (duration) {
    case 'short':
      cache.setShort(key, data);
      break;
    case 'medium':
      cache.setMedium(key, data);
      break;
    case 'long':
      cache.setLong(key, data);
      break;
  }

  return data;
}

/**
 * Invalidate cache عند التحديث
 */
export function invalidateCache(patterns: string[]) {
  patterns.forEach(pattern => {
    cache.deletePattern(pattern);
  });
}

// ============================================
// Predefined Cache Keys
// ============================================

export const CacheKeys = {
  // Categories
  CATEGORIES_ALL: 'categories:all',
  CATEGORIES_TREE: 'categories:tree',
  CATEGORY: (id: string) => `category:${id}`,
  
  // Articles
  ARTICLES_LIST: (page: number, limit: number) => `articles:list:${page}:${limit}`,
  ARTICLES_FEATURED: 'articles:featured',
  ARTICLES_BREAKING: 'articles:breaking',
  ARTICLE: (slug: string) => `article:${slug}`,
  ARTICLE_RELATED: (id: string) => `article:${id}:related`,
  
  // Users
  USER: (id: string) => `user:${id}`,
  USERS_LIST: (page: number) => `users:list:${page}`,
  
  // Ads
  ADS_PLACEMENT: (placement: string) => `ads:placement:${placement}`,
  ADS_ACTIVE: 'ads:active',
  
  // Settings
  SETTINGS: 'settings:all',
  
  // Stats
  STATS_DASHBOARD: 'stats:dashboard',
  STATS_ARTICLES: 'stats:articles',
};

/**
 * Middleware للـ cache في Express
 */
export function cacheMiddleware(duration: 'short' | 'medium' | 'long' = 'medium') {
  return (req: any, res: any, next: any) => {
    // إنشاء مفتاح فريد بناءً على الـ URL والـ query parameters
    const key = `route:${req.method}:${req.originalUrl}`;
    
    // محاولة الحصول من الـ cache
    let cached: any;
    switch (duration) {
      case 'short':
        cached = cache.getShort(key);
        break;
      case 'medium':
        cached = cache.getMedium(key);
        break;
      case 'long':
        cached = cache.getLong(key);
        break;
    }

    if (cached) {
      logDebug(`Route cache hit: ${key}`);
      return res.json(cached);
    }

    // حفظ الـ json الأصلي
    const originalJson = res.json.bind(res);

    // استبدال res.json لحفظ النتيجة في الـ cache
    res.json = (data: any) => {
      switch (duration) {
        case 'short':
          cache.setShort(key, data);
          break;
        case 'medium':
          cache.setMedium(key, data);
          break;
        case 'long':
          cache.setLong(key, data);
          break;
      }
      return originalJson(data);
    };

    next();
  };
}

export default cache;

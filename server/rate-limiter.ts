import rateLimit from 'express-rate-limit';
import { logWarn } from './logger';

/**
 * Rate limiter عام للـ API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 1000, // 1000 طلب لكل IP (واسع جداً)
  message: {
    error: "طلبات كثيرة جداً",
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // إرجاع معلومات rate limit في headers
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter لتسجيل الدخول (أكثر صرامة)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  skipSuccessfulRequests: true, // لا تحسب المحاولات الناجحة
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  handler: (req, res) => {
    logWarn('Login rate limit exceeded', {
      ip: req.ip,
      email: req.body.email
    });
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Your account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter لإنشاء الحسابات
 */
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 حسابات فقط في الساعة
  message: {
    error: 'Too many accounts created from this IP',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    logWarn('Account creation rate limit exceeded', {
      ip: req.ip,
      email: req.body.email
    });
    res.status(429).json({
      error: 'Too many accounts created',
      message: 'You have exceeded the account creation limit. Please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Rate limiter لإعادة تعيين كلمة المرور
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 محاولات فقط
  message: {
    error: 'Too many password reset attempts',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    logWarn('Password reset rate limit exceeded', {
      ip: req.ip,
      email: req.body.email
    });
    res.status(429).json({
      error: 'Too many password reset attempts',
      message: 'Please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Rate limiter للعمليات الحساسة (حذف، تعديل)
 */
export const sensitiveOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 10, // 10 عمليات فقط
  message: {
    error: 'Too many operations, please slow down',
    retryAfter: '5 minutes'
  }
});

/**
 * Rate limiter للبحث (لمنع scraping)
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 20, // 20 بحث في الدقيقة
  message: {
    error: 'Too many search requests',
    retryAfter: '1 minute'
  }
});

/**
 * Rate limiter لرفع الملفات
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10, // 10 ملفات فقط
  message: {
    error: 'Too many file uploads',
    retryAfter: '15 minutes'
  }
});

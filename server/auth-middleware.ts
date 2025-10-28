// ============================================
// نظام الحماية والتحقق المتقدم
// Advanced Authentication & Authorization Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { Role, Permission, hasPermission, hasRoleLevel } from '../shared/permissions';
import { storage } from './storage';

// ============================================
// تمديد Request لإضافة معلومات المستخدم
// Extend Request to include user info
// ============================================

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        permissions: Permission[];
        ip: string;
        sessionId: string;
      };
    }
  }
}

// ============================================
// Middleware: التحقق من تسجيل الدخول
// Middleware: Verify Authentication
// ============================================

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // الحصول على التوكن
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.authToken ||
                  req.body?.token;

    if (!token) {
      return res.status(401).json({ 
        error: 'غير مصرح',
        message: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
        redirect: '/login'
      });
    }

    // التحقق من التوكن وجلب المستخدم
    // في نظام حقيقي، يجب التحقق من قاعدة البيانات
    const userEmail = req.session?.userEmail;
    
    if (!userEmail) {
      return res.status(401).json({ 
        error: 'جلسة منتهية',
        message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
        redirect: '/login'
      });
    }

    const user = await storage.getUserByEmail(userEmail);

    if (!user) {
      return res.status(401).json({ 
        error: 'مستخدم غير موجود',
        redirect: '/login'
      });
    }

    // إضافة معلومات المستخدم إلى الطلب
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      permissions: [], // سيتم ملؤها لاحقاً
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      sessionId: req.sessionID || 'unknown',
    };

    // تسجيل النشاط
    await logActivity({
      userId: user.id,
      action: 'access',
      resource: req.path,
      ip: req.user.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({ 
      error: 'خطأ في التحقق',
      message: 'حدث خطأ أثناء التحقق من الهوية'
    });
  }
}

// ============================================
// Middleware: التحقق من الدور
// Middleware: Verify Role
// ============================================

export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'غير مصرح',
        redirect: '/login'
      });
    }

    if (!roles.includes(req.user.role)) {
      await logActivity({
        userId: req.user.id,
        action: 'access_denied',
        resource: req.path,
        ip: req.user.ip,
        details: `Role ${req.user.role} attempted to access ${roles.join(', ')} only resource`,
      });

      return res.status(403).json({ 
        error: 'ممنوع',
        message: 'ليس لديك صلاحية الوصول إلى هذا المورد',
        requiredRole: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

// ============================================
// Middleware: التحقق من الصلاحية
// Middleware: Verify Permission
// ============================================

export function requirePermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'غير مصرح',
        redirect: '/login'
      });
    }

    // التحقق من جميع الصلاحيات المطلوبة
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(req.user!.role, permission)
    );

    if (!hasAllPermissions) {
      await logActivity({
        userId: req.user.id,
        action: 'permission_denied',
        resource: req.path,
        ip: req.user.ip,
        details: `Missing permissions: ${permissions.join(', ')}`,
      });

      return res.status(403).json({ 
        error: 'ممنوع',
        message: 'ليس لديك الصلاحيات الكافية لهذا الإجراء',
        requiredPermissions: permissions,
      });
    }

    next();
  };
}

// ============================================
// Middleware: التحقق من أي صلاحية
// Middleware: Verify Any Permission
// ============================================

export function requireAnyPermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'غير مصرح',
        redirect: '/login'
      });
    }

    // التحقق من أي صلاحية من القائمة
    const hasAnyPerm = permissions.some(permission => 
      hasPermission(req.user!.role, permission)
    );

    if (!hasAnyPerm) {
      await logActivity({
        userId: req.user.id,
        action: 'permission_denied',
        resource: req.path,
        ip: req.user.ip,
        details: `Requires any of: ${permissions.join(', ')}`,
      });

      return res.status(403).json({ 
        error: 'ممنوع',
        message: 'ليس لديك الصلاحيات الكافية لهذا الإجراء',
      });
    }

    next();
  };
}

// ============================================
// Middleware: التحقق من مستوى الدور
// Middleware: Verify Role Level
// ============================================

export function requireRoleLevel(minimumRole: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'غير مصرح',
        redirect: '/login'
      });
    }

    if (!hasRoleLevel(req.user.role, minimumRole)) {
      await logActivity({
        userId: req.user.id,
        action: 'access_denied',
        resource: req.path,
        ip: req.user.ip,
        details: `Role level insufficient: ${req.user.role} < ${minimumRole}`,
      });

      return res.status(403).json({ 
        error: 'ممنوع',
        message: 'مستوى صلاحياتك غير كافٍ لهذا الإجراء',
      });
    }

    next();
  };
}

// ============================================
// Middleware: حماية من Brute Force
// Middleware: Brute Force Protection
// ============================================

const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now, blocked: false };
  
  // إعادة تعيين بعد 15 دقيقة
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
    attempts.blocked = false;
  }
  
  // التحقق من الحظر
  if (attempts.blocked) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000);
    return res.status(429).json({
      error: 'محظور مؤقتاً',
      message: `تم حظرك مؤقتاً بسبب المحاولات المتكررة. حاول مرة أخرى بعد ${remainingTime} ثانية`,
      remainingTime,
    });
  }
  
  // زيادة العداد
  attempts.count++;
  attempts.lastAttempt = now;
  
  // حظر بعد 5 محاولات
  if (attempts.count >= 5) {
    attempts.blocked = true;
    loginAttempts.set(ip, attempts);
    
    return res.status(429).json({
      error: 'محظور مؤقتاً',
      message: 'تم حظرك لمدة 15 دقيقة بسبب المحاولات الفاشلة المتكررة',
      remainingTime: 900,
    });
  }
  
  loginAttempts.set(ip, attempts);
  next();
}

// ============================================
// دالة تسجيل الأنشطة
// Activity Logging Function
// ============================================

interface ActivityLog {
  userId: string;
  action: string;
  resource: string;
  ip: string;
  userAgent?: string;
  details?: string;
}

async function logActivity(log: ActivityLog) {
  try {
    // في نظام حقيقي، يجب حفظ هذا في قاعدة البيانات
    console.log('[Activity Log]', {
      timestamp: new Date().toISOString(),
      ...log,
    });
    
    // يمكن إضافة حفظ في قاعدة البيانات هنا
    // await storage.createActivityLog(log);
  } catch (error) {
    console.error('[Activity Log] Error:', error);
  }
}

// ============================================
// Middleware: تسجيل IP الحقيقي
// Middleware: Real IP Logging
// ============================================

export function captureRealIP(req: Request, res: Response, next: NextFunction) {
  // الحصول على IP الحقيقي من خلف Proxy
  const realIP = 
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown';
  
  // حفظ IP الحقيقي
  req.ip = Array.isArray(realIP) ? realIP[0] : realIP.split(',')[0].trim();
  
  next();
}

// ============================================
// Middleware: CSRF Protection
// Middleware: CSRF Protection
// ============================================

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // تخطي GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      error: 'رمز CSRF غير صالح',
      message: 'فشل التحقق من الأمان',
    });
  }
  
  next();
}

// ============================================
// Middleware: XSS Protection
// Middleware: XSS Protection
// ============================================

export function xssProtection(req: Request, res: Response, next: NextFunction) {
  // إضافة Headers للحماية من XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
}

// ============================================
// دالة مساعدة: إعادة تعيين محاولات تسجيل الدخول
// Helper: Reset Login Attempts
// ============================================

export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

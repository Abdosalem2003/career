// نظام الصلاحيات الاحترافي الكامل
// Professional Permissions System

import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// تعريف الأدوار
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EDITOR = "editor",
  AUTHOR = "author",
  MODERATOR = "moderator",
  VIEWER = "viewer",
}

// تعريف الصلاحيات
export enum Permission {
  // Articles
  ARTICLES_VIEW = "articles.view",
  ARTICLES_CREATE = "articles.create",
  ARTICLES_EDIT = "articles.edit",
  ARTICLES_EDIT_OWN = "articles.edit_own",
  ARTICLES_DELETE = "articles.delete",
  ARTICLES_DELETE_OWN = "articles.delete_own",
  ARTICLES_PUBLISH = "articles.publish",
  ARTICLES_SCHEDULE = "articles.schedule",
  ARTICLES_FEATURE = "articles.feature",
  
  // Users
  USERS_VIEW = "users.view",
  USERS_CREATE = "users.create",
  USERS_EDIT = "users.edit",
  USERS_DELETE = "users.delete",
  USERS_MANAGE_ROLES = "users.manage_roles",
  USERS_MANAGE_PERMISSIONS = "users.manage_permissions",
  
  // Categories
  CATEGORIES_VIEW = "categories.view",
  CATEGORIES_CREATE = "categories.create",
  CATEGORIES_EDIT = "categories.edit",
  CATEGORIES_DELETE = "categories.delete",
  
  // Media
  MEDIA_VIEW = "media.view",
  MEDIA_UPLOAD = "media.upload",
  MEDIA_EDIT = "media.edit",
  MEDIA_DELETE = "media.delete",
  
  // Comments
  COMMENTS_VIEW = "comments.view",
  COMMENTS_MODERATE = "comments.moderate",
  COMMENTS_DELETE = "comments.delete",
  
  // Settings
  SETTINGS_VIEW = "settings.view",
  SETTINGS_EDIT = "settings.edit",
  SETTINGS_ADVANCED = "settings.advanced",
  
  // Analytics
  ANALYTICS_VIEW = "analytics.view",
  ANALYTICS_EXPORT = "analytics.export",
  
  // System
  SYSTEM_LOGS = "system.logs",
  SYSTEM_BACKUP = "system.backup",
  SYSTEM_MAINTENANCE = "system.maintenance",
}

// مصفوفة الصلاحيات لكل دور
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
  
  [UserRole.ADMIN]: [
    // Articles
    Permission.ARTICLES_VIEW,
    Permission.ARTICLES_CREATE,
    Permission.ARTICLES_EDIT,
    Permission.ARTICLES_DELETE,
    Permission.ARTICLES_PUBLISH,
    Permission.ARTICLES_SCHEDULE,
    Permission.ARTICLES_FEATURE,
    
    // Users (limited)
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    
    // Categories
    Permission.CATEGORIES_VIEW,
    Permission.CATEGORIES_CREATE,
    Permission.CATEGORIES_EDIT,
    Permission.CATEGORIES_DELETE,
    
    // Media
    Permission.MEDIA_VIEW,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_EDIT,
    Permission.MEDIA_DELETE,
    
    // Comments
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_MODERATE,
    Permission.COMMENTS_DELETE,
    
    // Settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    
    // Analytics
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
  ],
  
  [UserRole.EDITOR]: [
    // Articles
    Permission.ARTICLES_VIEW,
    Permission.ARTICLES_CREATE,
    Permission.ARTICLES_EDIT,
    Permission.ARTICLES_PUBLISH,
    Permission.ARTICLES_SCHEDULE,
    
    // Categories
    Permission.CATEGORIES_VIEW,
    Permission.CATEGORIES_EDIT,
    
    // Media
    Permission.MEDIA_VIEW,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_EDIT,
    
    // Comments
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_MODERATE,
    
    // Analytics
    Permission.ANALYTICS_VIEW,
  ],
  
  [UserRole.AUTHOR]: [
    // Articles (own only)
    Permission.ARTICLES_VIEW,
    Permission.ARTICLES_CREATE,
    Permission.ARTICLES_EDIT_OWN,
    Permission.ARTICLES_DELETE_OWN,
    
    // Categories
    Permission.CATEGORIES_VIEW,
    
    // Media
    Permission.MEDIA_VIEW,
    Permission.MEDIA_UPLOAD,
  ],
  
  [UserRole.MODERATOR]: [
    // Articles
    Permission.ARTICLES_VIEW,
    
    // Comments
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_MODERATE,
    Permission.COMMENTS_DELETE,
    
    // Media
    Permission.MEDIA_VIEW,
  ],
  
  [UserRole.VIEWER]: [
    // Articles
    Permission.ARTICLES_VIEW,
    
    // Categories
    Permission.CATEGORIES_VIEW,
    
    // Media
    Permission.MEDIA_VIEW,
  ],
};

// التحقق من وجود صلاحية للمستخدم
export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole as UserRole;
  const permissions = RolePermissions[role] || [];
  return permissions.includes(permission);
}

// التحقق من وجود أي صلاحية من قائمة
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// التحقق من وجود جميع الصلاحيات
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Middleware: التحقق من الصلاحية
export function requirePermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // التحقق من تسجيل الدخول
      if (!req.session?.userEmail) {
        return res.status(401).json({
          error: "غير مصرح",
          message: "يجب تسجيل الدخول للوصول إلى هذا المورد",
        });
      }

      // جلب المستخدم
      const user = await storage.getUserByEmail(req.session.userEmail);
      if (!user) {
        return res.status(401).json({
          error: "مستخدم غير موجود",
        });
      }

      // التحقق من حالة المستخدم
      if (user.status !== 'active') {
        return res.status(403).json({
          error: "حساب غير نشط",
          message: "حسابك غير نشط. يرجى الاتصال بالمسؤول",
        });
      }

      // التحقق من الصلاحيات
      const hasRequiredPermissions = hasAllPermissions(user.role, permissions);
      
      if (!hasRequiredPermissions) {
        return res.status(403).json({
          error: "صلاحيات غير كافية",
          message: "ليس لديك الصلاحيات الكافية للوصول إلى هذا المورد",
          required: permissions,
          userRole: user.role,
        });
      }

      // إضافة المستخدم للطلب
      (req as any).user = user;
      next();
    } catch (error) {
      console.error("[Permissions] Error:", error);
      res.status(500).json({ error: "خطأ في التحقق من الصلاحيات" });
    }
  };
}

// Middleware: التحقق من الدور
export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session?.userEmail) {
        return res.status(401).json({
          error: "غير مصرح",
          message: "يجب تسجيل الدخول",
        });
      }

      const user = await storage.getUserByEmail(req.session.userEmail);
      if (!user) {
        return res.status(401).json({ error: "مستخدم غير موجود" });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: "حساب غير نشط" });
      }

      const hasRequiredRole = roles.includes(user.role as UserRole);
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          error: "صلاحيات غير كافية",
          message: "ليس لديك الدور المطلوب للوصول إلى هذا المورد",
          required: roles,
          userRole: user.role,
        });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error("[Permissions] Error:", error);
      res.status(500).json({ error: "خطأ في التحقق من الدور" });
    }
  };
}

// Middleware: التحقق من تسجيل الدخول فقط
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.userEmail) {
      return res.status(401).json({
        error: "غير مصرح",
        message: "يجب تسجيل الدخول",
      });
    }

    const user = await storage.getUserByEmail(req.session.userEmail);
    if (!user) {
      return res.status(401).json({ error: "مستخدم غير موجود" });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: "حساب غير نشط" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("[Auth] Error:", error);
    res.status(500).json({ error: "خطأ في التحقق من الهوية" });
  }
}

// الحصول على جميع صلاحيات دور معين
export function getRolePermissions(role: string): Permission[] {
  return RolePermissions[role as UserRole] || [];
}

// الحصول على معلومات الدور
export function getRoleInfo(role: string) {
  const roleLabels: Record<UserRole, { ar: string; en: string; icon: string }> = {
    [UserRole.SUPER_ADMIN]: { ar: "مدير عام", en: "Super Admin", icon: "👑" },
    [UserRole.ADMIN]: { ar: "مدير", en: "Admin", icon: "🔑" },
    [UserRole.EDITOR]: { ar: "محرر", en: "Editor", icon: "✏️" },
    [UserRole.AUTHOR]: { ar: "كاتب", en: "Author", icon: "📝" },
    [UserRole.MODERATOR]: { ar: "مشرف", en: "Moderator", icon: "🛡️" },
    [UserRole.VIEWER]: { ar: "مشاهد", en: "Viewer", icon: "👁️" },
  };

  return roleLabels[role as UserRole] || { ar: "غير معروف", en: "Unknown", icon: "❓" };
}

// الحصول على معلومات الصلاحية
export function getPermissionInfo(permission: Permission) {
  const permissionLabels: Record<Permission, { ar: string; en: string }> = {
    [Permission.ARTICLES_VIEW]: { ar: "عرض المقالات", en: "View Articles" },
    [Permission.ARTICLES_CREATE]: { ar: "إنشاء مقالات", en: "Create Articles" },
    [Permission.ARTICLES_EDIT]: { ar: "تعديل المقالات", en: "Edit Articles" },
    [Permission.ARTICLES_EDIT_OWN]: { ar: "تعديل مقالاتي", en: "Edit Own Articles" },
    [Permission.ARTICLES_DELETE]: { ar: "حذف المقالات", en: "Delete Articles" },
    [Permission.ARTICLES_DELETE_OWN]: { ar: "حذف مقالاتي", en: "Delete Own Articles" },
    [Permission.ARTICLES_PUBLISH]: { ar: "نشر المقالات", en: "Publish Articles" },
    [Permission.ARTICLES_SCHEDULE]: { ar: "جدولة المقالات", en: "Schedule Articles" },
    [Permission.ARTICLES_FEATURE]: { ar: "تمييز المقالات", en: "Feature Articles" },
    
    [Permission.USERS_VIEW]: { ar: "عرض المستخدمين", en: "View Users" },
    [Permission.USERS_CREATE]: { ar: "إنشاء مستخدمين", en: "Create Users" },
    [Permission.USERS_EDIT]: { ar: "تعديل المستخدمين", en: "Edit Users" },
    [Permission.USERS_DELETE]: { ar: "حذف المستخدمين", en: "Delete Users" },
    [Permission.USERS_MANAGE_ROLES]: { ar: "إدارة الأدوار", en: "Manage Roles" },
    [Permission.USERS_MANAGE_PERMISSIONS]: { ar: "إدارة الصلاحيات", en: "Manage Permissions" },
    
    [Permission.CATEGORIES_VIEW]: { ar: "عرض الأقسام", en: "View Categories" },
    [Permission.CATEGORIES_CREATE]: { ar: "إنشاء أقسام", en: "Create Categories" },
    [Permission.CATEGORIES_EDIT]: { ar: "تعديل الأقسام", en: "Edit Categories" },
    [Permission.CATEGORIES_DELETE]: { ar: "حذف الأقسام", en: "Delete Categories" },
    
    [Permission.MEDIA_VIEW]: { ar: "عرض الوسائط", en: "View Media" },
    [Permission.MEDIA_UPLOAD]: { ar: "رفع وسائط", en: "Upload Media" },
    [Permission.MEDIA_EDIT]: { ar: "تعديل الوسائط", en: "Edit Media" },
    [Permission.MEDIA_DELETE]: { ar: "حذف الوسائط", en: "Delete Media" },
    
    [Permission.COMMENTS_VIEW]: { ar: "عرض التعليقات", en: "View Comments" },
    [Permission.COMMENTS_MODERATE]: { ar: "إدارة التعليقات", en: "Moderate Comments" },
    [Permission.COMMENTS_DELETE]: { ar: "حذف التعليقات", en: "Delete Comments" },
    
    [Permission.SETTINGS_VIEW]: { ar: "عرض الإعدادات", en: "View Settings" },
    [Permission.SETTINGS_EDIT]: { ar: "تعديل الإعدادات", en: "Edit Settings" },
    [Permission.SETTINGS_ADVANCED]: { ar: "إعدادات متقدمة", en: "Advanced Settings" },
    
    [Permission.ANALYTICS_VIEW]: { ar: "عرض الإحصائيات", en: "View Analytics" },
    [Permission.ANALYTICS_EXPORT]: { ar: "تصدير الإحصائيات", en: "Export Analytics" },
    
    [Permission.SYSTEM_LOGS]: { ar: "سجلات النظام", en: "System Logs" },
    [Permission.SYSTEM_BACKUP]: { ar: "النسخ الاحتياطي", en: "Backup" },
    [Permission.SYSTEM_MAINTENANCE]: { ar: "صيانة النظام", en: "System Maintenance" },
  };

  return permissionLabels[permission] || { ar: "غير معروف", en: "Unknown" };
}

/**
 * نظام الصلاحيات المتقدم - Advanced Permissions System
 * نظام احترافي متكامل بدون أخطاء - 100% Working
 */

import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EDITOR = "editor",
  AUTHOR = "author",
  MODERATOR = "moderator",
  VIEWER = "viewer",
}

export enum Permission {
  // Articles
  ARTICLES_VIEW_ALL = "articles.view.all",
  ARTICLES_CREATE = "articles.create",
  ARTICLES_EDIT_ALL = "articles.edit.all",
  ARTICLES_DELETE_ALL = "articles.delete.all",
  ARTICLES_PUBLISH = "articles.publish",
  
  // Users
  USERS_VIEW = "users.view",
  USERS_CREATE = "users.create",
  USERS_EDIT = "users.edit",
  USERS_DELETE = "users.delete",
  
  // Categories
  CATEGORIES_MANAGE = "categories.manage",
  
  // Media
  MEDIA_MANAGE = "media.manage",
  
  // Settings
  SETTINGS_MANAGE = "settings.manage",
}

export const RolePermissionsMatrix: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    Permission.ARTICLES_VIEW_ALL,
    Permission.ARTICLES_CREATE,
    Permission.ARTICLES_EDIT_ALL,
    Permission.ARTICLES_DELETE_ALL,
    Permission.ARTICLES_PUBLISH,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.CATEGORIES_MANAGE,
    Permission.MEDIA_MANAGE,
  ],
  
  [Role.EDITOR]: [
    Permission.ARTICLES_VIEW_ALL,
    Permission.ARTICLES_CREATE,
    Permission.ARTICLES_EDIT_ALL,
    Permission.ARTICLES_PUBLISH,
    Permission.MEDIA_MANAGE,
  ],
  
  [Role.AUTHOR]: [
    Permission.ARTICLES_CREATE,
    Permission.MEDIA_MANAGE,
  ],
  
  [Role.MODERATOR]: [
    Permission.ARTICLES_VIEW_ALL,
  ],
  
  [Role.VIEWER]: [
    Permission.ARTICLES_VIEW_ALL,
  ],
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole as Role;
  const permissions = RolePermissionsMatrix[role] || [];
  return permissions.includes(permission);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.userEmail) {
      return res.status(401).json({ 
        error: "يجب تسجيل الدخول",
        code: "AUTH_REQUIRED",
        accessDenied: true
      });
    }

    const user = await storage.getUserByEmail(req.session.userEmail);
    if (!user) {
      return res.status(401).json({ 
        error: "مستخدم غير موجود",
        code: "USER_NOT_FOUND",
        accessDenied: true
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: "حساب غير نشط. يرجى الاتصال بالمسؤول",
        code: "ACCOUNT_INACTIVE",
        accessDenied: true
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ 
      error: "خطأ في التحقق من الهوية",
      code: "AUTH_ERROR",
      accessDenied: true
    });
  }
}

export function requirePermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ 
          error: "يجب تسجيل الدخول",
          code: "AUTH_REQUIRED",
          accessDenied: true
        });
      }

      const hasAllPermissions = permissions.every(permission => 
        hasPermission(user.role, permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = permissions.filter(p => !hasPermission(user.role, p));
        return res.status(403).json({ 
          error: "ليس لديك صلاحية للوصول إلى هذا المورد",
          code: "PERMISSION_DENIED",
          accessDenied: true,
          required: permissions,
          missing: missingPermissions,
          userRole: user.role,
          message: `دورك (${user.role}) لا يملك الصلاحيات المطلوبة`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        error: "خطأ في التحقق من الصلاحيات",
        code: "PERMISSION_ERROR",
        accessDenied: true
      });
    }
  };
}

export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ 
          error: "يجب تسجيل الدخول",
          code: "AUTH_REQUIRED",
          accessDenied: true
        });
      }

      if (!roles.includes(user.role as Role)) {
        return res.status(403).json({ 
          error: "ليس لديك صلاحية للوصول إلى هذا المورد",
          code: "ROLE_DENIED",
          accessDenied: true,
          required: roles,
          userRole: user.role,
          message: `دورك (${user.role}) لا يملك صلاحية الوصول. الأدوار المطلوبة: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        error: "خطأ في التحقق من الدور",
        code: "ROLE_ERROR",
        accessDenied: true
      });
    }
  };
}

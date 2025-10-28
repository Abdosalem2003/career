/**
 * Permissions Middleware
 * التحقق من الصلاحيات
 */

import { Request, Response, NextFunction } from "express";
import { Permission, Role, RolePermissions } from "@shared/permissions";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        permissions?: Permission[];
      };
    }
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - No user session" });
    }

    // Get permissions for user's role
    const rolePermissions = RolePermissions[user.role] || [];

    // Check if user has the required permission
    if (!rolePermissions.includes(permission)) {
      return res.status(403).json({ 
        error: "Forbidden - Insufficient permissions",
        required: permission,
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rolePermissions = RolePermissions[user.role] || [];
    const hasAny = permissions.some(p => rolePermissions.includes(p));

    if (!hasAny) {
      return res.status(403).json({ 
        error: "Forbidden - Insufficient permissions",
        required: permissions,
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rolePermissions = RolePermissions[user.role] || [];
    const hasAll = permissions.every(p => rolePermissions.includes(p));

    if (!hasAll) {
      return res.status(403).json({ 
        error: "Forbidden - Insufficient permissions",
        required: permissions,
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Check if user has specific role
 */
export function hasRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        error: "Forbidden - Insufficient role",
        required: roles,
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Check if user owns the resource
 */
export function isOwner(getOwnerId: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ownerId = getOwnerId(req);

    // Super Admin and Admin can access all
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      return next();
    }

    // Check ownership
    if (user.id !== ownerId) {
      return res.status(403).json({ 
        error: "Forbidden - Not the owner",
        userId: user.id,
        ownerId
      });
    }

    next();
  };
}

/**
 * Check if user is owner OR has permission
 */
export function isOwnerOrHasPermission(
  getOwnerId: (req: Request) => string,
  permission: Permission
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ownerId = getOwnerId(req);
    const rolePermissions = RolePermissions[user.role] || [];

    // Check if owner OR has permission
    if (user.id === ownerId || rolePermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ 
      error: "Forbidden - Not owner and insufficient permissions"
    });
  };
}

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface PermissionCheck {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  accessDenied: boolean;
  code?: string;
  message?: string;
}

// Role Permissions Matrix - must match server
const RolePermissions: Record<string, string[]> = {
  super_admin: [
    "articles.view.all",
    "articles.create",
    "articles.edit.all",
    "articles.delete.all",
    "articles.publish",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "categories.manage",
    "media.manage",
    "settings.manage",
  ],
  admin: [
    "articles.view.all",
    "articles.create",
    "articles.edit.all",
    "articles.delete.all",
    "articles.publish",
    "users.view",
    "users.create",
    "users.edit",
    "categories.manage",
    "media.manage",
  ],
  editor: [
    "articles.view.all",
    "articles.create",
    "articles.edit.all",
    "articles.publish",
    "media.manage",
  ],
  author: [
    "articles.create",
    "media.manage",
  ],
  moderator: [
    "articles.view.all",
  ],
  viewer: [
    "articles.view.all",
  ],
};

export function usePermissions(requiredPermissions: string[]): PermissionCheck {
  const [state, setState] = useState<PermissionCheck>({
    hasPermission: false,
    isLoading: true,
    error: null,
    user: null,
    accessDenied: false,
  });

  useEffect(() => {
    const checkPermissions = () => {
      try {
        // If no permissions required, skip check
        if (!requiredPermissions || requiredPermissions.length === 0) {
          setState({
            hasPermission: true,
            isLoading: false,
            error: null,
            user: null,
            accessDenied: false,
          });
          return;
        }

        // Get user from storage
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "يجب تسجيل الدخول",
            user: null,
            accessDenied: true,
            code: "AUTH_REQUIRED",
            message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
          });
          return;
        }

        const user: User = JSON.parse(userStr);

        // Check if user is active
        if (user.status !== 'active') {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "حساب غير نشط",
            user,
            accessDenied: true,
            code: "ACCOUNT_INACTIVE",
            message: "حسابك غير نشط. يرجى الاتصال بالمسؤول",
          });
          return;
        }

        // Get user permissions
        const userPermissions = RolePermissions[user.role] || [];

        // Check if user has all required permissions
        const hasAll = requiredPermissions.every(perm => 
          userPermissions.includes(perm)
        );

        if (!hasAll) {
          const missing = requiredPermissions.filter(perm => 
            !userPermissions.includes(perm)
          );
          
          setState({
            hasPermission: false,
            isLoading: false,
            error: "ليس لديك صلاحية للوصول",
            user,
            accessDenied: true,
            code: "PERMISSION_DENIED",
            message: `دورك (${user.role}) لا يملك الصلاحيات المطلوبة: ${missing.join(', ')}`,
          });
          return;
        }

        // User has permission
        setState({
          hasPermission: true,
          isLoading: false,
          error: null,
          user,
          accessDenied: false,
        });
      } catch (error) {
        setState({
          hasPermission: false,
          isLoading: false,
          error: "خطأ في التحقق من الصلاحيات",
          user: null,
          accessDenied: true,
          code: "PERMISSION_ERROR",
        });
      }
    };

    checkPermissions();
  }, [requiredPermissions.join(',')]);

  return state;
}

// Hook to check if user has specific role
export function useRole(requiredRoles: string[]): PermissionCheck {
  const [state, setState] = useState<PermissionCheck>({
    hasPermission: false,
    isLoading: true,
    error: null,
    user: null,
    accessDenied: false,
  });

  useEffect(() => {
    const checkRole = () => {
      try {
        // If no roles required, skip check
        if (!requiredRoles || requiredRoles.length === 0) {
          setState({
            hasPermission: true,
            isLoading: false,
            error: null,
            user: null,
            accessDenied: false,
          });
          return;
        }

        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "يجب تسجيل الدخول",
            user: null,
            accessDenied: true,
            code: "AUTH_REQUIRED",
          });
          return;
        }

        const user: User = JSON.parse(userStr);

        if (user.status !== 'active') {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "حساب غير نشط",
            user,
            accessDenied: true,
            code: "ACCOUNT_INACTIVE",
          });
          return;
        }

        if (!requiredRoles.includes(user.role)) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "ليس لديك صلاحية للوصول",
            user,
            accessDenied: true,
            code: "ROLE_DENIED",
            message: `دورك (${user.role}) لا يملك صلاحية الوصول. الأدوار المطلوبة: ${requiredRoles.join(', ')}`,
          });
          return;
        }

        setState({
          hasPermission: true,
          isLoading: false,
          error: null,
          user,
          accessDenied: false,
        });
      } catch (error) {
        setState({
          hasPermission: false,
          isLoading: false,
          error: "خطأ في التحقق من الدور",
          user: null,
          accessDenied: true,
          code: "ROLE_ERROR",
        });
      }
    };

    checkRole();
  }, [requiredRoles.join(',')]);

  return state;
}

// Hook to check if user is authenticated
export function useAuth(): PermissionCheck {
  const [state, setState] = useState<PermissionCheck>({
    hasPermission: false,
    isLoading: true,
    error: null,
    user: null,
    accessDenied: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "يجب تسجيل الدخول",
            user: null,
            accessDenied: true,
            code: "AUTH_REQUIRED",
          });
          return;
        }

        const user: User = JSON.parse(userStr);

        if (user.status !== 'active') {
          setState({
            hasPermission: false,
            isLoading: false,
            error: "حساب غير نشط",
            user,
            accessDenied: true,
            code: "ACCOUNT_INACTIVE",
          });
          return;
        }

        setState({
          hasPermission: true,
          isLoading: false,
          error: null,
          user,
          accessDenied: false,
        });
      } catch (error) {
        setState({
          hasPermission: false,
          isLoading: false,
          error: "خطأ في التحقق من الهوية",
          user: null,
          accessDenied: true,
          code: "AUTH_ERROR",
        });
      }
    };

    checkAuth();
  }, []);

  return state;
}

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { usePermissions, useRole } from '@/hooks/use-permissions';
import { AccessDenied } from './access-denied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions,
  requiredRoles 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Always call hooks - React rule
  const permissionCheck = usePermissions(requiredPermissions || []);
  const roleCheck = useRole(requiredRoles || []);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      setIsChecking(false);
      setLocation('/login');
      return;
    }

    try {
      JSON.parse(user);
      setIsChecking(false);
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsChecking(false);
      setLocation('/login');
    }
  }, [setLocation]);

  // Loading state
  if (isChecking || permissionCheck.isLoading || roleCheck.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Check permissions (only if permissions are required)
  if (requiredPermissions && requiredPermissions.length > 0 && permissionCheck.accessDenied) {
    return (
      <AccessDenied
        message={permissionCheck.message || permissionCheck.error || undefined}
        code={permissionCheck.code}
        userRole={permissionCheck.user?.role}
        required={requiredPermissions}
      />
    );
  }

  // Check roles (only if roles are required)
  if (requiredRoles && requiredRoles.length > 0 && roleCheck.accessDenied) {
    return (
      <AccessDenied
        message={roleCheck.message || roleCheck.error || undefined}
        code={roleCheck.code}
        userRole={roleCheck.user?.role}
        required={requiredRoles}
      />
    );
  }

  return <>{children}</>;
}

// Hook للحصول على المستخدم الحالي
export function useAuth() {
  const [, setLocation] = useLocation();

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setLocation('/login');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  return {
    user: getUser(),
    logout,
    isAuthenticated: isAuthenticated(),
  };
}

import { Shield, Lock, AlertTriangle, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface AccessDeniedProps {
  message?: string;
  code?: string;
  userRole?: string;
  required?: string[];
  onRetry?: () => void;
}

export function AccessDenied({ 
  message, 
  code, 
  userRole, 
  required,
  onRetry 
}: AccessDeniedProps) {
  const [, setLocation] = useLocation();
  const language = "ar"; // Default to Arabic

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    setLocation('/login');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2 border-red-200 dark:border-red-900">
        <CardContent className="p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 opacity-20 blur-2xl rounded-full"></div>
              <div className="relative bg-red-100 dark:bg-red-900 p-6 rounded-full">
                <Shield className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {language === "ar" ? "الوصول مرفوض" : "Access Denied"}
          </h1>

          {/* Error Code */}
          {code && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-mono text-red-600 dark:text-red-400">
                {code}
              </span>
            </div>
          )}

          {/* Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  {message || (language === "ar" 
                    ? "ليس لديك صلاحية للوصول إلى هذه الصفحة" 
                    : "You don't have permission to access this page"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* User Role Info */}
          {userRole && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <span className="font-semibold">
                  {language === "ar" ? "دورك الحالي:" : "Your current role:"}
                </span>{" "}
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {userRole}
                </span>
              </div>
              {required && required.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  <span className="font-semibold">
                    {language === "ar" ? "الصلاحيات المطلوبة:" : "Required permissions:"}
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {required.map((perm, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-mono"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {language === "ar" 
              ? "إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بمسؤول النظام"
              : "If you believe this is an error, please contact the system administrator"
            }
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              {language === "ar" ? "الصفحة الرئيسية" : "Home"}
            </Button>

            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                {language === "ar" ? "إعادة المحاولة" : "Retry"}
              </Button>
            )}

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {language === "ar" ? "تسجيل الخروج" : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

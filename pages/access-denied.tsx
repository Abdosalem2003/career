// ============================================
// صفحة رفض الوصول الاحترافية
// Professional Access Denied Page
// ============================================

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldX, Home, ArrowRight, Lock, AlertTriangle } from "lucide-react";

export default function AccessDenied() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Animated Circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <Card className="relative z-10 w-full max-w-2xl border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
        <div className="p-12 text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <ShieldX className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-gray-900 flex items-center justify-center gap-3">
              <span className="text-6xl">🚫</span>
              <span>ممنوع الوصول</span>
            </h1>
            <p className="text-2xl font-bold text-red-600">
              Access Denied
            </p>
          </div>

          {/* Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <Lock className="h-5 w-5" />
              <p className="text-lg font-bold">
                ليس لديك صلاحية الوصول إلى هذه الصفحة
              </p>
            </div>
            <p className="text-red-600">
              You don't have permission to access this page
            </p>
          </div>

          {/* Details */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-right">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              الأسباب المحتملة:
            </h3>
            <ul className="space-y-2 text-orange-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>ليس لديك الصلاحيات الكافية للوصول إلى هذا المورد</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>دورك الحالي لا يسمح بهذا الإجراء</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>تحتاج إلى تسجيل الدخول بحساب له صلاحيات أعلى</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>قد يكون حسابك موقوفاً أو غير نشط</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold h-12 px-8 shadow-lg"
            >
              <Home className="h-5 w-5 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-2 border-gray-300 hover:bg-gray-50 font-bold h-12 px-8"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              الرجوع للخلف
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
            <p>
              إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالمسؤول
            </p>
            <p className="text-xs text-gray-500 mt-1">
              If you believe this is an error, please contact the administrator
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

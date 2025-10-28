// صفحة Debug للتحقق من حالة التطبيق
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Debug() {
  const [, setLocation] = useLocation();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // قراءة البيانات من localStorage
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    setAuthToken(token);
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e: any) {
        setError(e.message);
      }
    }
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@news.com',
          password: 'admin123'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('✅ تسجيل الدخول نجح!');
        window.location.reload();
      } else {
        alert('❌ فشل: ' + data.error);
      }
    } catch (e: any) {
      alert('❌ خطأ: ' + e.message);
    }
  };

  const clearData = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('✅ تم مسح جميع البيانات');
    window.location.reload();
  };

  const goToAdmin = () => {
    setLocation('/admin');
  };

  const goToUsersManagement = () => {
    setLocation('/admin/users-management');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center mb-8">🔍 صفحة Debug</h1>

        {/* حالة التوكن */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 Auth Token</CardTitle>
          </CardHeader>
          <CardContent>
            {authToken ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-mono text-sm break-all">{authToken}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800">❌ لا يوجد توكن</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* بيانات المستخدم */}
        <Card>
          <CardHeader>
            <CardTitle>👤 User Data</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800">❌ لا توجد بيانات مستخدم</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الأخطاء */}
        {error && (
          <Card>
            <CardHeader>
              <CardTitle>⚠️ Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* الإجراءات */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              🔐 اختبار تسجيل الدخول (admin@news.com)
            </Button>
            
            <Button 
              onClick={clearData} 
              variant="destructive"
              className="w-full"
            >
              🗑️ مسح جميع البيانات
            </Button>

            <Button 
              onClick={goToAdmin} 
              variant="outline"
              className="w-full"
            >
              📊 الذهاب إلى /admin
            </Button>

            <Button 
              onClick={goToUsersManagement} 
              variant="outline"
              className="w-full"
            >
              👥 الذهاب إلى /admin/users-management
            </Button>

            <Button 
              onClick={() => setLocation('/login')} 
              variant="outline"
              className="w-full"
            >
              🔓 الذهاب إلى /login
            </Button>
          </CardContent>
        </Card>

        {/* معلومات النظام */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Current Path:</strong> {window.location.pathname}</p>
              <p><strong>localStorage Keys:</strong> {Object.keys(localStorage).join(', ') || 'none'}</p>
              <p><strong>sessionStorage Keys:</strong> {Object.keys(sessionStorage).join(', ') || 'none'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

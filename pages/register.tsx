import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل التسجيل');
      }

      // Success - Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      setLocation('/dash-unnt-2025');
    } catch (err: any) {
      setError(err.message || 'فشل التسجيل. يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
              <User className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-200 mb-1">إنشاء حساب جديد</h1>
            <p className="text-sm text-slate-500">سجل للوصول إلى لوحة التحكم</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="pr-10 pl-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-400"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  className="pr-10 pl-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-400"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all border border-slate-600/50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التسجيل...</span>
                </div>
              ) : (
                'تسجيل حساب جديد'
              )}
            </Button>
          </form>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => setLocation('/login')}
                className="text-slate-300 hover:text-slate-200 font-medium"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

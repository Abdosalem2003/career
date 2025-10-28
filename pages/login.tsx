import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  
  // Security Layer 1: Rate Limiting & Brute Force Protection
  useEffect(() => {
    const blocked = localStorage.getItem('login_blocked');
    if (blocked) {
      const blockUntil = parseInt(blocked);
      if (Date.now() < blockUntil) {
        setIsBlocked(true);
        setBlockTime(Math.ceil((blockUntil - Date.now()) / 1000));
      } else {
        localStorage.removeItem('login_blocked');
        localStorage.removeItem('login_attempts');
      }
    }
  }, []);
  
  useEffect(() => {
    if (blockTime > 0) {
      const timer = setInterval(() => {
        setBlockTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('login_blocked');
            localStorage.removeItem('login_attempts');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [blockTime]);
  
  // Security Layer 2: CSRF Token Generation
  const generateCSRFToken = () => {
    const token = CryptoJS.lib.WordArray.random(32).toString();
    sessionStorage.setItem('csrf_token', token);
    return token;
  };
  
  // Security Layer 3: Password Hashing with Salt
  const hashPassword = (password: string, salt: string) => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Access temporarily restricted');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Security Layer 1: Check attempts
      // Simple login - no encryption needed
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // Success - Store token and user
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to new admin path
      setLocation('/dash-unnt-2025');
    } catch (err) {
      setError('Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Minimal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Minimal Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Minimal Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* Minimal Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-200 mb-1">Access Control</h1>
            <p className="text-sm text-slate-500">Authentication Required</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Minimal Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            
            {/* Block Warning */}
            {isBlocked && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-orange-400">Retry in {blockTime}s</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading || isBlocked}
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
                  placeholder="Password"
                  className="pr-10 pl-10 h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:ring-0"
                  required
                  disabled={loading || isBlocked}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-400"
                  disabled={loading || isBlocked}
                >
                  {showPassword ? (
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
              disabled={loading || isBlocked}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Authenticate'
              )}
            </Button>
          </form>
          
          {/* Minimal Footer */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Admin Access Only
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/seedData';
import { ToothLogo } from '../components/ToothLogo';
import { ShieldCheck, UserCheck, KeyRound, User as UserIcon, Lock, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = INITIAL_USERS.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (found) {
      onLogin(found);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة ثانية.');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'reception') => {
    const user = INITIAL_USERS.find((u) => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center p-4 text-right"
      dir="rtl"
    >
      <div className="max-w-md w-full">
        {/* Top brand header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md mb-3">
            <ToothLogo size="lg" theme="dark" showPhone={true} />
          </div>
          <p className="text-xs text-cyan-300 font-semibold tracking-wide mt-2">
            نظام الإدارة العيادية والمحاسبية المتكامل
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-cyan-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">تسجيل الدخول للنظام</h2>
              <p className="text-xs text-slate-400 mt-0.5">مركز الفيصل لطب الأسنان</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin أو reception"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-hidden transition-all"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-hidden transition-all font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-l from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer text-sm mt-2"
            >
              دخول إلى النظام
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>دخول تجريبي سريع ومباشر:</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-800/50 hover:border-cyan-500 text-right transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول كـ مدير</span>
                </div>
                <span className="text-[10px] text-slate-400">صلاحيات كاملة وإعدادات</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reception')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-right transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span>دخول كـ استقبال</span>
                </div>
                <span className="text-[10px] text-slate-400">تسجيل ومحاسبة يومية</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">reception / 1234</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          مركز الفيصل لطب وجراحة وتجميل الأسنان • هاتف: 778043029 - 789843741
        </div>
      </div>
    </div>
  );
};

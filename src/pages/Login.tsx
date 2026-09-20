import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authenticateUser, getAllUsers } from '../lib/db';
import { INITIAL_USERS } from '../data/seedData';
import { ToothLogo } from '../components/ToothLogo';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [codeOrPass, setCodeOrPass] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    // Load users from local DB to support newly registered users
    getAllUsers()
      .then((users) => {
        if (users && users.length > 0) {
          setAvailableUsers(users);
        }
      })
      .catch(() => {
        setAvailableUsers(INITIAL_USERS);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputId = identifier.trim().toLowerCase();
    const inputCode = codeOrPass.trim();

    if (!inputId) {
      setError('يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }

    if (!inputCode) {
      setError('يرجى إدخال رمز الدخول السري (PIN) أو كلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try DB authentication
      let authenticated = await authenticateUser(inputId, inputCode);

      // 2. Fallback to in-memory list if DB empty or cold
      if (!authenticated) {
        authenticated =
          availableUsers.find((u) => {
            const matchesId =
              u.username.toLowerCase() === inputId ||
              (u.email && u.email.toLowerCase() === inputId);
            const matchesCode =
              u.password === inputCode || (u.pinCode && u.pinCode === inputCode);
            return matchesId && matchesCode;
          }) || null;
      }

      if (authenticated) {
        onLogin(authenticated);
      } else {
        setError('البريد الإلكتروني/اسم المستخدم أو رمز الدخول غير صحيح. يرجى التحقق وإعادة المحاولة.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة ثانية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: User) => {
    onLogin(u);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center p-4 text-right selection:bg-cyan-500 selection:text-white"
      dir="rtl"
    >
      <div className="max-w-lg w-full">
        {/* Top Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md mb-2">
            <ToothLogo size="lg" theme="dark" showPhone={true} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-semibold mt-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>نظام الإدارة والعيادات والمحاسبة متعدد الفروع • V3.0</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 border border-cyan-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>تسجيل الدخول للنظام</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                الدخول متاح بالبريد الإلكتروني والرمز السري (PIN) أو اسم المستخدم
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                البريد الإلكتروني أو اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="مثال: marwan@alfaisal.com أو admin"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-hidden transition-all text-right dir-rtl font-medium"
                />
                <Mail className="w-4 h-4 text-cyan-500 absolute top-3.5 right-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  رمز الدخول السري (PIN) أو كلمة المرور
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">يدعم الرمز المكون من أرقام</span>
              </div>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  required
                  value={codeOrPass}
                  onChange={(e) => setCodeOrPass(e.target.value)}
                  placeholder="الرمز السري (مثلاً: 2026 أو 1234)"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 pr-10 pl-10 text-sm text-white placeholder-slate-500 outline-hidden transition-all font-mono tracking-widest text-right"
                />
                <KeyRound className="w-4 h-4 text-cyan-500 absolute top-3.5 right-3.5" />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="text-slate-500 hover:text-slate-300 absolute top-3 left-3 p-1 cursor-pointer transition-colors"
                  title={showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-cyan-500 via-cyan-600 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>دخول إلى النظام والمحاسبة</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Instant Demo Access Buttons */}
          <div className="mt-7 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>حسابات تجريبية سريعة بنقرة واحدة:</span>
              </span>
              <span className="text-[10px] text-slate-500">اختر للدخول الفوري</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Doctor Marwan - Admin */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    availableUsers.find((u) => u.username === 'admin') || INITIAL_USERS[0]
                  )
                }
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-800/50 hover:border-cyan-400 transition-all group cursor-pointer text-right"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">د. مروان العامري</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">marwan@alfaisal.com</span>
                <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-slate-700/60 text-[10px]">
                  <span className="text-slate-400">الرمز:</span>
                  <span className="font-mono font-bold text-amber-300">2026</span>
                </div>
              </button>

              {/* Reception */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    availableUsers.find((u) => u.username === 'reception') || INITIAL_USERS[1]
                  )
                }
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all group cursor-pointer text-right"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-0.5">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">أحمد الصبري</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">reception@alfaisal.com</span>
                <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-slate-700/60 text-[10px]">
                  <span className="text-slate-400">الرمز:</span>
                  <span className="font-mono font-bold text-cyan-300">1234</span>
                </div>
              </button>

              {/* Hadda Branch Manager */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    availableUsers.find((u) => u.username === 'hadda_admin') || INITIAL_USERS[2]
                  )
                }
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-800/40 hover:border-emerald-400 transition-all group cursor-pointer text-right"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">د. سارة (فرع حدة)</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">hadda@alfaisal.com</span>
                <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-slate-700/60 text-[10px]">
                  <span className="text-slate-400">الرمز:</span>
                  <span className="font-mono font-bold text-emerald-300">7712</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-5 text-[11px] text-slate-500 leading-relaxed">
          مركز الفيصل لطب وجراحة وتجميل وزراعة الأسنان • الجمهورية اليمنية
          <br />
          خدمة العملاء والإدارة العامة: 778043029 - 789843741
        </div>
      </div>
    </div>
  );
};

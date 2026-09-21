import React, { useState, useEffect } from 'react';
import { User, Branch, Doctor } from '../types';
import {
  authenticateUser,
  getAllUsers,
  getAllBranches,
  saveUser,
  saveBranch,
  saveDoctor,
} from '../lib/db';
import { INITIAL_USERS, INITIAL_BRANCHES } from '../data/seedData';
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
  UserPlus,
  LogIn,
  Plus,
  Phone,
  User as UserIcon,
  ChevronLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, targetBranchId?: string) => void;
  branches?: Branch[];
  activeBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
  onAddBranch?: (branch: Branch) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({
  onLogin,
  branches: propsBranches,
  activeBranchId = 'all',
  onSelectBranch,
  onAddBranch,
}) => {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Branch list
  const [localBranches, setLocalBranches] = useState<Branch[]>(
    propsBranches && propsBranches.length > 0 ? propsBranches : INITIAL_BRANCHES
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    activeBranchId && activeBranchId !== 'all'
      ? activeBranchId
      : localBranches[0]?.id || 'b-sanaa-main'
  );

  // New branch inline creation modal/drawer
  const [isAddingNewBranch, setIsAddingNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('صنعاء');
  const [newBranchPhone, setNewBranchPhone] = useState('778043029');
  const [newBranchManager, setNewBranchManager] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [codeOrPass, setCodeOrPass] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>(INITIAL_USERS);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'doctor' | 'reception'>('admin');
  const [regBranchChoice, setRegBranchChoice] = useState<string>(selectedBranchId);
  const [regCustomBranchName, setRegCustomBranchName] = useState('');

  useEffect(() => {
    // Load users & branches from local DB
    getAllUsers()
      .then((users) => {
        if (users && users.length > 0) {
          setAvailableUsers(users);
        }
      })
      .catch(() => {
        setAvailableUsers(INITIAL_USERS);
      });

    getAllBranches()
      .then((bList) => {
        if (bList && bList.length > 0) {
          setLocalBranches(bList);
          if (!selectedBranchId || selectedBranchId === 'all') {
            setSelectedBranchId(bList[0]?.id);
          }
        }
      })
      .catch(() => {
        setLocalBranches(INITIAL_BRANCHES);
      });
  }, []);

  // Synchronize when propsBranches change
  useEffect(() => {
    if (propsBranches && propsBranches.length > 0) {
      setLocalBranches(propsBranches);
    }
  }, [propsBranches]);

  const handleBranchSelect = (bId: string) => {
    setSelectedBranchId(bId);
    setRegBranchChoice(bId);
    if (onSelectBranch) {
      onSelectBranch(bId);
    }
  };

  // Quick Direct Entry to branch without credential friction
  const handleDirectBranchEntry = async (branchId: string) => {
    const branch = localBranches.find((b) => b.id === branchId) || localBranches[0];
    const matchingUser =
      availableUsers.find((u) => u.branchId === branch?.id) ||
      availableUsers.find((u) => u.role === 'admin') ||
      INITIAL_USERS[0];

    const sessionUser: User = {
      ...matchingUser,
      branchId: branch.id,
      branchName: branch.name,
    };

    if (onSelectBranch) {
      onSelectBranch(branch.id);
    }
    onLogin(sessionUser, branch.id);
  };

  // Create new branch directly from the Login page
  const handleCreateNewBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      setError('يرجى كتابة اسم الفرع الجديد');
      return;
    }

    const branchId = `b-${Date.now()}`;
    const newBranch: Branch = {
      id: branchId,
      name: newBranchName.trim(),
      code: `BR-${Math.floor(10 + Math.random() * 90)}`,
      city: newBranchCity.trim() || 'صنعاء',
      address: newBranchName.trim(),
      phone: newBranchPhone.trim() || '778043029',
      manager: newBranchManager.trim() || 'مدير الفرع',
      isMain: false,
      status: 'active',
    };

    try {
      if (onAddBranch) {
        await onAddBranch(newBranch);
      } else {
        await saveBranch(newBranch);
      }

      setLocalBranches((prev) => [...prev, newBranch]);
      setSelectedBranchId(branchId);
      setRegBranchChoice(branchId);
      setIsAddingNewBranch(false);
      setNewBranchName('');
      setSuccessMsg(`تم تسجيل فرع (${newBranch.name}) بنجاح ويمكنك الدخول إليه الآن`);
    } catch (err) {
      setError('فشل في حفظ الفرع الجديد');
    }
  };

  // Handle standard Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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
      let authenticated = await authenticateUser(inputId, inputCode);

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
        const activeBranch =
          localBranches.find((b) => b.id === selectedBranchId) ||
          localBranches.find((b) => b.id === authenticated?.branchId) ||
          localBranches[0];

        const finalUser: User = {
          ...authenticated,
          branchId: activeBranch.id,
          branchName: activeBranch.name,
        };

        if (onSelectBranch) {
          onSelectBranch(activeBranch.id);
        }
        onLogin(finalUser, activeBranch.id);
      } else {
        setError('البريد الإلكتروني/اسم المستخدم أو رمز الدخول غير صحيح. يرجى التحقق وإعادة المحاولة.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة ثانية.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle New Account Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setError('يرجى كتابة الاسم الكامل للمستخدم');
      return;
    }

    if (!regUsername.trim()) {
      setError('يرجى تحديد اسم المستخدم (Username)');
      return;
    }

    if (!regPassword.trim()) {
      setError('يرجى إدخال كلمة المرور أو رمز الدخول السري (PIN)');
      return;
    }

    setIsLoading(true);
    try {
      let branchToAssignId = regBranchChoice;
      let branchToAssignName =
        localBranches.find((b) => b.id === regBranchChoice)?.name || 'الفرع الرئيسي';

      // If user chose to write a custom branch name
      if (regBranchChoice === 'custom' || regCustomBranchName.trim()) {
        const customName = regCustomBranchName.trim() || 'فرع جديد';
        const newBranchId = `b-${Date.now()}`;
        const createdBranch: Branch = {
          id: newBranchId,
          name: customName,
          code: `BR-${Math.floor(10 + Math.random() * 90)}`,
          city: 'صنعاء',
          address: customName,
          phone: regPhone.trim() || '778043029',
          manager: regFullName.trim(),
          isMain: false,
          status: 'active',
        };

        if (onAddBranch) {
          await onAddBranch(createdBranch);
        } else {
          await saveBranch(createdBranch);
        }

        setLocalBranches((prev) => [...prev, createdBranch]);
        branchToAssignId = newBranchId;
        branchToAssignName = customName;
      }

      const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '_');
      const cleanEmail =
        regEmail.trim().toLowerCase() || `${cleanUsername}@alfaisal.com`;

      // Check if username exists
      const exists = availableUsers.some(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          (u.email && u.email.toLowerCase() === cleanEmail)
      );

      if (exists) {
        setError('اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً! يرجى اختيار اسم آخر.');
        setIsLoading(false);
        return;
      }

      const newUserId = `u-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        username: cleanUsername,
        fullName: regFullName.trim(),
        email: cleanEmail,
        password: regPassword.trim(),
        pinCode: regPassword.trim(),
        phone: regPhone.trim() || '778043029',
        role: regRole,
        branchId: branchToAssignId,
        branchName: branchToAssignName,
        isActive: true,
      };

      // Save user to DB
      await saveUser(newUser);

      // If registered as doctor, also register in the Doctor database with the approved 40% percentage!
      if (regRole === 'doctor' || regRole === 'admin') {
        const newDoctor: Doctor = {
          id: `doc-${Date.now()}`,
          name: regFullName.trim().startsWith('د.') ? regFullName.trim() : `د. ${regFullName.trim()}`,
          phone: regPhone.trim() || '778043029',
          email: cleanEmail,
          degree: 'بكالوريوس طب وجراحة الفم والأسنان',
          specialty: 'طب وجراحة وتجميل الأسنان',
          percentage: 40, // Standard 40% doctor commission as requested
          branchId: branchToAssignId,
          branchName: branchToAssignName,
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: 'طبيب مسجل جديد',
        };
        await saveDoctor(newDoctor);
      }

      setAvailableUsers((prev) => [...prev, newUser]);
      if (onSelectBranch) {
        onSelectBranch(branchToAssignId);
      }

      // Automatically log the user in immediately into their branch
      onLogin(newUser, branchToAssignId);
    } catch (err: any) {
      setError('فشل في إنشاء الحساب: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentSelectedBranch =
    localBranches.find((b) => b.id === selectedBranchId) || localBranches[0];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-right selection:bg-cyan-500 selection:text-white"
      dir="rtl"
    >
      <div className="max-w-3xl w-full">
        {/* Top Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-md mb-2">
            <ToothLogo size="lg" theme="dark" showPhone={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            مركز الفيصل لطب وجراحة وتجميل وزراعة الأسنان
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/90 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-semibold mt-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>نظام الإدارة السريرية والمحاسبة والربط الشبكي متعدد الفروع • V3.5</span>
          </div>
        </div>

        {/* 1. Branch Selection & Direct Entry Gateway Strip */}
        <div className="bg-slate-900/95 border border-cyan-800/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">
                  بوابة الفروع: اختر الفرع أو سجّل فرعاً جديداً للدخول المباشر
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                يمكنك تحديد فرعك الآن للدخول المباشر عليه قبل تسجيل الدخول
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNewBranch(!isAddingNewBranch)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNewBranch ? 'إلغاء' : 'تسجيل فرع جديد'}</span>
            </button>
          </div>

          {/* Form to add a new branch on the fly */}
          {isAddingNewBranch && (
            <form
              onSubmit={handleCreateNewBranch}
              className="mb-4 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تسجيل اسم فرع جديد في المركز:</span>
                </span>
                <span className="text-[10px] text-slate-400">يدخل عليه فور الحفظ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    اسم الفرع الجديد *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="مثال: فرع تعز - شارع جمال أو فرع مأرب"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    placeholder="صنعاء / تعز / إب..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNewBranch(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-l from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حفظ الفرع واعتماده</span>
                </button>
              </div>
            </form>
          )}

          {/* Branch Pill Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {localBranches.map((b) => {
              const isSelected = selectedBranchId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => handleBranchSelect(b.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-right ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-900/30'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-extrabold text-xs text-white line-clamp-1">
                      {b.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-700/50">
                    <span>{b.city}</span>
                    <span className="text-cyan-300 font-bold">
                      {b.isMain ? '★ الرئيسي' : b.code}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Direct Entry to this Branch */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-xs">
              <span className="text-slate-400">الفرع المحدد حالياً: </span>
              <span className="text-cyan-300 font-extrabold mr-1">
                {currentSelectedBranch?.name || 'الفرع الرئيسي'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDirectBranchEntry(selectedBranchId)}
              className="px-4 py-2 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-700/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              title="دخول مباشر وسريع إلى هذا الفرع بدون كلمة مرور"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>دخول مباشر للفرع الآن</span>
            </button>
          </div>
        </div>

        {/* 2. Main Login / Register Card */}
        <div className="bg-slate-900/95 border border-cyan-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tabs: Sign In VS Register New Account */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-gradient-to-l from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
                authMode === 'register'
                  ? 'bg-gradient-to-l from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                جديد
              </span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed font-semibold">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="leading-relaxed font-semibold">{successMsg}</p>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authMode === 'login' ? (
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>تسجيل الدخول للنظام</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الفرع النشط:{' '}
                    <span className="text-cyan-400 font-bold">
                      {currentSelectedBranch?.name}
                    </span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-hidden transition-all text-right font-medium"
                    />
                    <Mail className="w-4 h-4 text-cyan-500 absolute top-3.5 right-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      رمز الدخول السري (PIN) أو كلمة المرور
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      يدعم رمز الأرقام (مثال: 2026 أو 1234)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showCode ? 'text' : 'password'}
                      required
                      value={codeOrPass}
                      onChange={(e) => setCodeOrPass(e.target.value)}
                      placeholder="الرمز السري أو كلمة المرور"
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
                      <span>دخول إلى فرع ({currentSelectedBranch?.name})</span>
                    </>
                  )}
                </button>
              </form>

              {/* Instant Accounts Quick List */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>حسابات تجريبية سريعة بنقرة واحدة:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">اختر للدخول الفوري</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const u =
                        availableUsers.find((user) => user.username === 'admin') ||
                        INITIAL_USERS[0];
                      onLogin(u, selectedBranchId);
                    }}
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

                  <button
                    type="button"
                    onClick={() => {
                      const u =
                        availableUsers.find((user) => user.username === 'reception') ||
                        INITIAL_USERS[1];
                      onLogin(u, selectedBranchId);
                    }}
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

                  <button
                    type="button"
                    onClick={() => {
                      const u =
                        availableUsers.find((user) => user.username === 'hadda_admin') ||
                        INITIAL_USERS[2];
                      onLogin(u, selectedBranchId);
                    }}
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
          ) : (
            /* TAB 2: REGISTER NEW ACCOUNT */
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>إنشاء حساب جديد وتعيين الفرع والصلاحيات</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    سجل حسابك وسيدخلك النظام مباشرة كأنه قد تم تسجيله من جديد فوراً
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
                  <UserPlus className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الاسم الكامل (المستخدم أو الطبيب) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="مثال: د. حسام عادل الشامي"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      اسم المستخدم (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="مثال: hosam"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم الجوال / الهاتف
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="778043029"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رمز الدخول السري (PIN) أو كلمة المرور *
                    </label>
                    <input
                      type="text"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="مثال: 5566 أو كلمة مرور"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-hidden font-mono font-bold text-cyan-300"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الصلاحية / الدور الوظيفي
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white outline-hidden cursor-pointer"
                    >
                      <option value="admin">مدير فرع / كامل الصلاحيات</option>
                      <option value="doctor">طبيب أسنان (نسبة معتمدة 40%)</option>
                      <option value="reception">موظف استقبال ومحاسبة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الفرع المخصص للحساب
                    </label>
                    <select
                      value={regBranchChoice}
                      onChange={(e) => setRegBranchChoice(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 px-3 text-xs text-white outline-hidden cursor-pointer"
                    >
                      {localBranches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                      <option value="custom">➕ كتابة فرع جديد الآن...</option>
                    </select>
                  </div>
                </div>

                {/* If custom branch selected */}
                {regBranchChoice === 'custom' && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-600/40 rounded-xl space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-cyan-300">
                      اسم الفرع الجديد الذي ترغب بإنشائه وتعيين الحساب له:
                    </label>
                    <input
                      type="text"
                      required
                      value={regCustomBranchName}
                      onChange={(e) => setRegCustomBranchName(e.target.value)}
                      placeholder="مثال: فرع تعز التخصصي"
                      className="w-full bg-slate-900 border border-cyan-500 rounded-lg py-2 px-3 text-xs text-white outline-hidden font-bold"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-l from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>إنشاء الحساب والدخول للفرع مباشرة</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500 leading-relaxed">
          مركز الفيصل لطب وجراحة وتجميل وزراعة الأسنان • الجمهورية اليمنية
          <br />
          خدمة العملاء والإدارة العامة المباشرة: 778043029 - 789843741
        </div>
      </div>
    </div>
  );
};

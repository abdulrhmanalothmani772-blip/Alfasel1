import React from 'react';
import { User, ClinicSettings, Branch } from '../types';
import { ToothLogo } from './ToothLogo';
import {
  LogOut,
  Download,
  Building2,
  UserCircle2,
  Menu,
  Coins,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  settings: ClinicSettings;
  branches: Branch[];
  activeBranchId: string;
  onSelectActiveBranch: (branchId: string) => void;
  onNavigateToBranches: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onQuickBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  branches,
  activeBranchId,
  onSelectActiveBranch,
  onNavigateToBranches,
  onLogout,
  onToggleSidebar,
  onQuickBackup,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  return (
    <header className="no-print sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-cyan-900/50 shadow-xl">
      <div className="flex items-center justify-between px-2.5 sm:px-6 h-16">
        {/* Right side: Menu button & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-cyan-400 hover:text-white hover:bg-slate-800 rounded-xl md:hidden transition-colors cursor-pointer"
            title="القائمة الكاملة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <ToothLogo size="sm" theme="dark" showPhone={false} />
        </div>

        {/* Center: Branch Switcher & Quick rates */}
        <div className="flex items-center gap-2">
          {/* Branch Switcher Pill */}
          <div className="relative flex items-center bg-slate-800/90 border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs shadow-inner">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0 ml-1.5" />
            <select
              value={activeBranchId}
              onChange={(e) => onSelectActiveBranch(e.target.value)}
              className="bg-transparent text-cyan-100 font-bold outline-hidden cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">
                جميع الفروع (شامل)
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name} {b.isMain ? '★ الرئيسي' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Exchange rates pill on larger screens */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/50 text-[11px] font-mono">
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-amber-300 font-bold">1 SAR = {settings.sarToYer} YER</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-300 font-bold">1 USD = {settings.usdToYer} YER</span>
          </div>
        </div>

        {/* Left side: Doctor Profile & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Backup Button */}
          <button
            type="button"
            onClick={onQuickBackup}
            className="p-2 sm:px-3 sm:py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            title="نسخ احتياطي فوري لقاعدة البيانات"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">نسخ احتياطي</span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
              {currentUser.fullName ? currentUser.fullName.charAt(0) : 'د'}
            </div>
            <div className="text-right hidden sm:block">
              <span className="font-extrabold text-slate-100 block leading-tight max-w-[130px] truncate">
                {currentUser.fullName || 'د. مروان العامري'}
              </span>
              <span className="text-[10px] font-bold text-amber-400 block leading-tight">
                {isAdmin ? 'مدير الفرع • كامل الصلاحيات' : 'موظف الاستقبال'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-rose-400 hover:text-white hover:bg-rose-600/80 rounded-xl transition-all cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

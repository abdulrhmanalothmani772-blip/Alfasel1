import React from 'react';
import { User, ClinicSettings } from '../types';
import { ToothLogo } from './ToothLogo';
import {
  LogOut,
  Download,
  ShieldCheck,
  UserCircle2,
  Menu,
  Coins,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  settings: ClinicSettings;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onQuickBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  onLogout,
  onToggleSidebar,
  onQuickBackup,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="no-print sticky top-0 z-30 bg-slate-900 text-white border-b border-cyan-900/60 shadow-lg">
      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Right side: Sidebar toggle (mobile) & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-cyan-400 hover:text-white hover:bg-slate-800 rounded-xl md:hidden"
            title="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>

          <ToothLogo size="sm" theme="dark" showPhone={false} />
        </div>

        {/* Center: Quick currency exchange rates indicator */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-cyan-900/40 text-xs">
          <div className="flex items-center gap-1 text-cyan-400 font-bold">
            <Coins className="w-4 h-4" />
            <span>أسعار الصرف:</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="bg-slate-900/90 px-2 py-0.5 rounded text-amber-300 font-bold">
              1 SAR = {settings.sarToYer} YER
            </span>
            <span className="bg-slate-900/90 px-2 py-0.5 rounded text-emerald-300 font-bold">
              1 USD = {settings.usdToYer} YER
            </span>
          </div>
        </div>

        {/* Left side: User badge, Quick Backup, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Backup button */}
          <button
            type="button"
            onClick={onQuickBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            title="تصدير نسخة احتياطية من قاعدة البيانات الآن"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">نسخ احتياطي الآن</span>
          </button>

          {/* User profile info */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-xs">
            <UserCircle2 className="w-5 h-5 text-cyan-400" />
            <div className="text-right">
              <span className="font-bold text-slate-100 block leading-tight max-w-[120px] truncate">
                {currentUser.fullName}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isAdmin ? 'text-amber-400' : 'text-cyan-400'
                }`}
              >
                {isAdmin ? 'مدير المركز (كامل الصلاحيات)' : 'موظف الاستقبال'}
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
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

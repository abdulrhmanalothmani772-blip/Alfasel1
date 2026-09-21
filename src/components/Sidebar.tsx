import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  UserCheck,
  Calculator,
  HeartPulse,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  MessageCircle,
  Settings,
  Building2,
  Camera,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'cases'
  | 'clinical-photos'
  | 'branches'
  | 'lab-expenses'
  | 'doctors'
  | 'doctor-settlement'
  | 'nurses'
  | 'clinic-expenses'
  | 'daily-summary'
  | 'reports'
  | 'reminders'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  pendingRemindersCount?: number;
  unpaidCasesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  userRole,
  pendingRemindersCount = 0,
  unpaidCasesCount = 0,
}) => {
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      roles: ['admin', 'reception'],
    },
    {
      id: 'patients' as NavTab,
      label: 'سجل المرضى',
      icon: Users,
      roles: ['admin', 'reception'],
    },
    {
      id: 'cases' as NavTab,
      label: 'الحالات والعلاج',
      icon: Stethoscope,
      badge: unpaidCasesCount > 0 ? `${unpaidCasesCount} متبقي` : undefined,
      badgeColor: 'bg-rose-500',
      roles: ['admin', 'reception'],
      highlight: true,
    },
    {
      id: 'clinical-photos' as NavTab,
      label: 'التوثيق الصوري والكاميرا',
      icon: Camera,
      roles: ['admin', 'reception'],
    },
    {
      id: 'branches' as NavTab,
      label: 'إدارة الفروع المستقلة',
      icon: Building2,
      roles: ['admin', 'reception'],
    },
    {
      id: 'doctor-settlement' as NavTab,
      label: 'محاسبة الأطباء اليومية',
      icon: Calculator,
      roles: ['admin', 'reception'],
    },
    {
      id: 'lab-expenses' as NavTab,
      label: 'خرج المعمل',
      icon: FlaskConical,
      roles: ['admin', 'reception'],
    },
    {
      id: 'doctors' as NavTab,
      label: 'سجل الأطباء',
      icon: UserCheck,
      roles: ['admin', 'reception'],
    },
    {
      id: 'nurses' as NavTab,
      label: 'الكادر التمريضي',
      icon: HeartPulse,
      roles: ['admin', 'reception'],
    },
    {
      id: 'clinic-expenses' as NavTab,
      label: 'مصاريف العيادة',
      icon: Receipt,
      roles: ['admin', 'reception'],
    },
    {
      id: 'daily-summary' as NavTab,
      label: 'الملخص اليومي',
      icon: FileSpreadsheet,
      roles: ['admin', 'reception'],
    },
    {
      id: 'reports' as NavTab,
      label: 'التقارير والإحصائيات',
      icon: BarChart3,
      roles: ['admin', 'reception'],
    },
    {
      id: 'reminders' as NavTab,
      label: 'تذكيرات الواتساب',
      icon: MessageCircle,
      badge: pendingRemindersCount > 0 ? `${pendingRemindersCount}` : undefined,
      badgeColor: 'bg-emerald-500',
      roles: ['admin', 'reception'],
    },
    {
      id: 'settings' as NavTab,
      label: 'الإعدادات والنسخ',
      icon: Settings,
      roles: ['admin'], // للمدير فقط
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden no-print"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`no-print fixed md:static top-0 right-0 z-40 h-full w-64 bg-slate-900 text-slate-200 flex flex-col border-l border-cyan-900/40 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-900/40 md:hidden">
          <span className="font-bold text-cyan-400 text-sm">القائمة الرئيسية</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                    isActive
                      ? 'bg-gradient-to-l from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : item.highlight
                      ? 'bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/40 hover:text-white border border-cyan-800/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full text-white font-mono font-bold ${
                        item.badgeColor || 'bg-cyan-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-cyan-950 text-center text-[10px] text-slate-500 font-mono">
          <span className="block font-bold text-slate-400">مركز الفيصل لطب الأسنان</span>
          <span>v1.0 • Offline Dexie DB</span>
        </div>
      </aside>
    </>
  );
};

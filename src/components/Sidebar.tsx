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
  Sparkles,
  ShieldCheck,
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

interface MenuItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  roles: UserRole[];
  highlight?: boolean;
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
  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'العيادة والمعالجات السريرية',
      items: [
        {
          id: 'dashboard',
          label: 'لوحة التحكم والمؤشرات',
          icon: LayoutDashboard,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'cases',
          label: 'الحالات ومعالجات الأسنان',
          icon: Stethoscope,
          badge: unpaidCasesCount > 0 ? `${unpaidCasesCount} متبقي` : undefined,
          badgeColor: 'bg-rose-500',
          roles: ['admin', 'doctor', 'reception'],
          highlight: true,
        },
        {
          id: 'patients',
          label: 'سجل وملفات المرضى',
          icon: Users,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'clinical-photos',
          label: 'التوثيق الصوري والكاميرا',
          icon: Camera,
          roles: ['admin', 'doctor', 'reception'],
        },
      ],
    },
    {
      title: 'المحاسبة والمالية (نسبة 40%)',
      items: [
        {
          id: 'doctor-settlement',
          label: 'محاسبة الأطباء (40%)',
          icon: Calculator,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'lab-expenses',
          label: 'خرج المعمل والتركيبات',
          icon: FlaskConical,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'clinic-expenses',
          label: 'مصاريف وتشغيل العيادة',
          icon: Receipt,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'daily-summary',
          label: 'الملخص المالي اليومي',
          icon: FileSpreadsheet,
          roles: ['admin', 'doctor', 'reception'],
        },
      ],
    },
    {
      title: 'الإدارة والفروع والتقارير',
      items: [
        {
          id: 'branches',
          label: 'إدارة الفروع المستقلة',
          icon: Building2,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'doctors',
          label: 'سجل الأطباء والكوادر',
          icon: UserCheck,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'nurses',
          label: 'الكادر التمريضي',
          icon: HeartPulse,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'reports',
          label: 'التقارير والإحصائيات',
          icon: BarChart3,
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'reminders',
          label: 'تذكيرات الواتساب',
          icon: MessageCircle,
          badge: pendingRemindersCount > 0 ? `${pendingRemindersCount}` : undefined,
          badgeColor: 'bg-emerald-500',
          roles: ['admin', 'doctor', 'reception'],
        },
        {
          id: 'settings',
          label: 'الإعدادات والنسخ الاحتياطي',
          icon: Settings,
          roles: ['admin'],
        },
      ],
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
        className={`no-print fixed md:static top-0 right-0 z-40 h-full w-64 lg:w-72 bg-slate-900 text-slate-200 flex flex-col border-l border-cyan-900/40 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-900/40 md:hidden">
          <span className="font-bold text-cyan-400 text-sm">القائمة الرئيسية</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {sections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(userRole)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>{section.title}</span>
                </div>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
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
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-cyan-400'
                                : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
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
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-center text-[10px] text-slate-500 font-mono">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام مركز الفيصل الطبي</span>
          </div>
          <span>V3.5 • بيئة تشغيل متكاملة للكمبيوتر</span>
        </div>
      </aside>
    </>
  );
};

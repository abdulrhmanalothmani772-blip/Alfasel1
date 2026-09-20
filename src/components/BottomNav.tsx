import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Building2,
  Menu,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
  unpaidCasesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
  unpaidCasesCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'cases',
      label: 'الحالات',
      icon: Stethoscope,
      badge: unpaidCasesCount,
    },
    {
      id: 'patients',
      label: 'المرضى',
      icon: Users,
    },
    {
      id: 'branches',
      label: 'الفروع',
      icon: Building2,
    },
  ];

  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-cyan-900/40 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-cyan-400 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ring-2 ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}

        {/* More Menu toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-slate-200 rounded-2xl transition-all cursor-pointer font-medium"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">المزيد</span>
        </button>
      </div>
    </nav>
  );
};

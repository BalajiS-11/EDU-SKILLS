import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Network, 
  TrendingDown, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.FC<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeTab,
  onTabChange,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'recommendation',
      label: 'Study Path',
      sublabel: 'Recommended',
      icon: Compass,
    },
    {
      id: 'concept-map',
      label: 'Topic Map',
      sublabel: 'Prerequisites',
      icon: Network,
    },
    {
      id: 'progress',
      label: 'Memory Review',
      sublabel: 'Retention',
      icon: TrendingDown,
    },
    {
      id: 'quiz',
      label: 'Practice Quiz',
      sublabel: 'Quick Test',
      icon: CheckCircle2,
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 shadow-sm select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      <div className="p-3 space-y-6">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex items-center justify-between px-2 pt-1">
          {!collapsed && (
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Menu
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {/* Active indicator border bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info in Sidebar */}
      {!collapsed ? (
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-700 truncate">
                Class 10 Math
              </span>
              <span className="text-[10px] text-slate-400">
                25 Core Topics
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center leading-tight">
            EDU SKILL • Active
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-100 flex justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
        </div>
      )}
    </aside>
  );
};

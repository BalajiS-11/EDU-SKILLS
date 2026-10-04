import React from 'react';
import { StudentSummary } from '../types';
import { 
  BrainCircuit, 
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  students: StudentSummary[];
  selectedStudent: StudentSummary | null;
  onSelectStudent: (student: StudentSummary) => void;
  onOpenWeightsModal: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onOpenWeightsModal,
  onNavigateHome,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-container transition-colors">
            <BrainCircuit className="w-5 h-5 text-on-primary-container" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-lg text-on-surface tracking-tight leading-tight">
                EDU SKILL
              </span>
            </div>
            <span className="text-[10px] font-medium text-secondary tracking-wide uppercase leading-none">
              Smart Learning & Revision
            </span>
          </div>
        </div>

        {/* Right Section: Sync Status + Weights Trigger + Student Switcher */}
        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/70 px-2.5 py-1 rounded-full text-xs text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">Smart Revision Active</span>
          </div>

          {/* Weights Configuration Icon Button */}
          <button
            onClick={onOpenWeightsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all hover:-translate-y-0.5"
            title="Adjust Study Preferences"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Study Focus</span>
          </button>

          {/* Student Switcher Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xs transition-all cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {selectedStudent ? selectedStudent.name.charAt(0) : 'S'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface leading-none">
                  {selectedStudent ? selectedStudent.name : 'Select Student'}
                </span>
                <span className="text-[10px] text-slate-500 leading-none mt-1">
                  {selectedStudent ? `${Math.round(selectedStudent.overall_accuracy * 100)}% Acc • ${selectedStudent.total_attempts} reviews` : ''}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />

              {/* Native invisible select for robust interaction */}
              <select
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                value={selectedStudent?.student_id || ''}
                onChange={(e) => {
                  const s = students.find(item => item.student_id === e.target.value);
                  if (s) onSelectStudent(s);
                }}
              >
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} (Acc: {Math.round(s.overall_accuracy * 100)}% • Mastery: {Math.round(s.overall_mastery * 100)}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

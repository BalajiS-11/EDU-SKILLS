import React from 'react';
import { StudentSummary, RecommendationResponse, ConceptRecommendation } from '../types';
import { 
  Zap, 
  Clock, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  BrainCircuit, 
  Award, 
  ShieldCheck,
  ChevronRight,
  Eye,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface DashboardProps {
  student: StudentSummary | null;
  recommendations: RecommendationResponse | null;
  loading: boolean;
  onSelectConcept: (conceptId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  student,
  recommendations,
  loading,
  onSelectConcept,
  onNavigateTab,
}) => {
  if (loading || !recommendations || !student) {
    return null; // Handled by SkeletonLoader in App.tsx
  }

  const topRec: ConceptRecommendation | undefined = recommendations.recommendations[0];
  const queue = recommendations.recommendations.slice(1);

  const recallPct = topRec ? Math.round(topRec.recall_probability * 100) : 50;
  const currentY = Math.max(25, Math.min(65, 75 - (recallPct * 0.5)));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Welcome & Session Status Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Personalized Study Plan</span>
          </div>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
            Welcome back, {student.name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-secondary">
            Here is your top recommended topic to practice today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-4 py-2 rounded-full shadow-xs text-xs text-secondary font-medium self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Overall Accuracy:</span>
          <span className="text-on-surface font-semibold">
            <AnimatedCounter value={student.overall_accuracy * 100} suffix="%" />
          </span>
        </div>
      </section>

      {/* Hero Recommended Next Card with Signature Teal Glow Effect */}
      {topRec && (
        <section className="relative group">
          {/* Signature ambient glow layer */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-primary/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Main Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-teal-50/25 border border-teal-200/70 shadow-[0_12px_36px_rgba(0,104,95,0.08)] backdrop-blur-sm">
            {/* Subtle radial highlights */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-100/50 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div className="flex-1 space-y-4.5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-300/80 text-teal-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Recommended Next
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    topRec.recall_probability < 0.65
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {topRec.recall_probability < 0.6 ? 'Needs Review' : 'Review Soon'} ({topRec.elapsed_days}d ago)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                    Core Foundation
                  </span>
                </div>

                {/* Title & Module */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-teal-700 tracking-wider uppercase">
                    MODULE • {topRec.module.toUpperCase()}
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight">
                    {topRec.name}
                  </h2>
                </div>

                {/* Diagnostic Rationale */}
                <div className="p-4 rounded-xl bg-white/80 border border-teal-100 shadow-xs flex items-start gap-3.5">
                  <BrainCircuit className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block uppercase tracking-wide">
                      Why practice this topic?
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {topRec.reason}
                    </p>
                  </div>
                </div>

                {/* 4 Stat Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-white/90 border border-slate-100 p-3.5 rounded-xl shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Memory Score</div>
                    <div className="text-xl font-bold font-headline text-on-surface flex items-baseline gap-1.5 mt-0.5">
                      <AnimatedCounter value={topRec.recall_probability * 100} suffix="%" />
                      <span className="text-[11px] font-semibold text-rose-600">
                        {topRec.recall_probability < 0.6 ? 'Decay' : 'Stable'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 border border-slate-100 p-3.5 rounded-xl shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Connected Topics</div>
                    <div className="text-xl font-bold font-headline text-on-surface mt-0.5">
                      <AnimatedCounter value={topRec.downstream_count} suffix=" Topics" />
                    </div>
                  </div>

                  <div className="bg-white/90 border border-slate-100 p-3.5 rounded-xl shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Est. Time</div>
                    <div className="text-xl font-bold font-headline text-primary mt-0.5">
                      5-8 Mins
                    </div>
                  </div>

                  <div className="bg-white/90 border border-slate-100 p-3.5 rounded-xl shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Goal</div>
                    <div className="text-xl font-bold font-headline text-cyan-700 mt-0.5">
                      Mastery
                    </div>
                  </div>
                </div>
              </div>

              {/* Trajectory mini widget & CTA */}
              <div className="xl:w-80 shrink-0 flex flex-col items-center justify-between p-6 bg-white/90 border border-teal-100/90 rounded-2xl gap-5 shadow-xs">
                <div className="w-full text-center space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Memory Retention
                  </span>
                  <div className="relative w-48 h-24 mx-auto mt-2">
                    <svg className="w-full h-full" viewBox="0 0 160 80">
                      <path
                        className="text-slate-200"
                        d="M 10 20 Q 70 25 150 70"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                      <motion.path
                        className="text-primary"
                        d={`M 10 20 Q 55 24 100 ${currentY}`}
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                      <circle
                        className="fill-rose-500 stroke-white stroke-2 animate-pulse"
                        cx="100"
                        cy={currentY}
                        r="5.5"
                      />
                      <text
                        className="fill-rose-600 text-[10px] font-bold"
                        x="108"
                        y={currentY - 2}
                      >
                        {recallPct}%
                      </text>
                      <line
                        className="text-rose-300"
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        x1="100"
                        x2="100"
                        y1={currentY}
                        y2="75"
                      />
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Reviewing this topic now will boost your long-term memory.
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <button
                    onClick={() => {
                      onSelectConcept(topRec.concept_id);
                      onNavigateTab('quiz');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Start Practice</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectConcept(topRec.concept_id);
                      onNavigateTab('recommendation');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Why this topic?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3 Secondary Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-teal-50 text-primary">
                <Award className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                Class 10 Math
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overall Mastery
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
                <AnimatedCounter value={student.overall_mastery * 100} suffix="%" />
              </span>
              <span className="text-xs text-slate-500 font-medium">across 25 topics</span>
            </div>
          </div>
          <div className="mt-4 pt-2">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(student.overall_mastery * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Target: 85%</span>
              <span>Status: Active</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold">
                Review Needed
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Topics to Review
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline font-bold text-2xl sm:text-3xl text-rose-600">
                <AnimatedCounter 
                  value={recommendations.recommendations.filter(r => r.recall_probability < 0.6).length} 
                />
              </span>
              <span className="text-xs text-slate-500 font-medium">topics below 60% memory</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Practice these topics soon to keep your knowledge fresh and prevent forgetting.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                Foundations
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Key Prerequisites
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline font-bold text-2xl sm:text-3xl text-indigo-700">
                <AnimatedCounter value={topRec?.downstream_count || 4} suffix=" Topics" />
              </span>
              <span className="text-xs text-slate-500 font-medium">unlocked by next lesson</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Mastering key foundation topics makes future lessons much easier to learn.
          </p>
        </div>
      </section>

      {/* Top 3 Revision Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Upcoming Topics
            </h3>
            <p className="text-xs text-secondary">
              Personalized recommendations based on your learning progress.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('recommendation')}
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
          >
            <span>View All Topics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.recommendations.map((rec, index) => (
            <motion.div
              key={rec.concept_id}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                index === 0
                  ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    Priority {rec.priority.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {rec.module}
                  </span>
                  <h4 className="font-headline font-bold text-base text-on-surface">
                    {rec.name}
                  </h4>
                </div>

                {/* Micro Metric Gauges */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Mastery</span>
                    <span className="text-xs font-bold text-slate-800">
                      {Math.round(rec.mastery * 100)}%
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Memory</span>
                    <span className={`text-xs font-bold ${
                      rec.recall_probability < 0.6 ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {Math.round(rec.recall_probability * 100)}%
                    </span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Importance</span>
                    <span className="text-xs font-bold text-indigo-700">
                      {Math.round(rec.criticality * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectConcept(rec.concept_id);
                    onNavigateTab('quiz');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-container text-white transition-colors text-center cursor-pointer shadow-xs"
                >
                  Practice Now
                </button>
                <button
                  onClick={() => {
                    onSelectConcept(rec.concept_id);
                    onNavigateTab('recommendation');
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Why this topic?"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

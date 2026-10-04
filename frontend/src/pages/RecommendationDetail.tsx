import React from 'react';
import { RecommendationResponse, ConceptRecommendation } from '../types';
import { 
  BrainCircuit, 
  TrendingDown, 
  Layers, 
  Calculator, 
  ArrowRight, 
  Sparkles, 
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface RecommendationDetailProps {
  recommendations: RecommendationResponse | null;
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const RecommendationDetail: React.FC<RecommendationDetailProps> = ({
  recommendations,
  selectedConceptId,
  onSelectConcept,
  onNavigateTab,
}) => {
  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No recommendation data available.
      </div>
    );
  }

  const recList = recommendations.recommendations;
  const activeRec: ConceptRecommendation = 
    recList.find(r => r.concept_id === selectedConceptId) || recList[0];

  const w = activeRec.weights || { w1_mastery: 0.33, w2_recall: 0.33, w3_criticality: 0.34 };
  const term1 = w.w1_mastery * activeRec.mastery_gap;
  const term2 = w.w2_recall * activeRec.forgetting_risk;
  const term3 = w.w3_criticality * activeRec.criticality;
  const totalScore = term1 + term2 + term3;

  const pct1 = Math.round((term1 / totalScore) * 100);
  const pct2 = Math.round((term2 / totalScore) * 100);
  const pct3 = Math.round((term3 / totalScore) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Header & Concept Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Smart Insights
          </div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">
            Why This Topic?
          </h1>
          <p className="text-sm text-secondary mt-1">
            EDU SKILL evaluates your mastery, review timing, and topic connections to pick the best topic for you.
          </p>
        </div>

        {/* Concept Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {recList.map((r, i) => (
            <button
              key={r.concept_id}
              onClick={() => onSelectConcept(r.concept_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeRec.concept_id === r.concept_id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              #{i + 1} {r.name.length > 14 ? `${r.name.slice(0, 12)}...` : r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Concept Hero Banner */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-primary/15 rounded-3xl blur-xl opacity-60 pointer-events-none" />
        
        <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-white via-white to-teal-50/20 border border-teal-200/70 shadow-[0_8px_30px_rgba(0,104,95,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase">
                {activeRec.module}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                {activeRec.concept_id.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                Priority Score: <AnimatedCounter value={activeRec.priority} decimals={2} />
              </span>
            </div>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
              {activeRec.name}
            </h2>
            <p className="text-sm text-slate-700 max-w-3xl leading-relaxed">
              {activeRec.reason}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectConcept(activeRec.concept_id);
                onNavigateTab('progress');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              View Memory Chart
            </button>
            <button
              onClick={() => {
                onSelectConcept(activeRec.concept_id);
                onNavigateTab('quiz');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Skill Gap */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary bg-teal-50 px-2 py-1 rounded-md">
                Weight: {(w.w1_mastery * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                FACTOR 01
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                Skill Gap
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How much practice you still need on this concept.
              </p>
            </div>

            {/* Gauge */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-600 font-medium">Current Mastery:</span>
                <span className="font-mono font-bold text-base text-teal-700">
                  <AnimatedCounter value={activeRec.mastery * 100} suffix="%" />
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(activeRec.mastery * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="text-slate-600 font-medium">Remaining Gap:</span>
                <span className="font-mono font-bold text-slate-800">
                  <AnimatedCounter value={activeRec.mastery_gap * 100} suffix="%" />
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Practice Attempts:</span>
                <span className="font-semibold text-slate-800">{activeRec.total_attempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Learning Status:</span>
                <span className="font-semibold text-teal-800 capitalize">{activeRec.status}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Contribution:</span>
            <span className="font-bold text-primary">
              +{term1.toFixed(2)} ({pct1}%)
            </span>
          </div>
        </motion.div>

        {/* Metric 2: Memory Retention */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                Weight: {(w.w2_recall * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                FACTOR 02
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                Memory Retention
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How fresh this topic is in your memory based on review time.
              </p>
            </div>

            {/* Gauge */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-600 font-medium">Memory Score:</span>
                <span className="font-mono font-bold text-base text-amber-600">
                  <AnimatedCounter value={activeRec.recall_probability * 100} suffix="%" />
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-amber-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(activeRec.recall_probability * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="text-slate-600 font-medium">Forgetting Risk:</span>
                <span className="font-mono font-bold text-rose-600">
                  <AnimatedCounter value={activeRec.forgetting_risk * 100} suffix="%" />
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Days Since Review:</span>
                <span className="font-semibold text-slate-800">{activeRec.elapsed_days} days</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Strength:</span>
                <span className="font-semibold text-slate-800">{activeRec.half_life_days} days</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Contribution:</span>
            <span className="font-bold text-amber-600">
              +{term2.toFixed(2)} ({pct2}%)
            </span>
          </div>
        </motion.div>

        {/* Metric 3: Curriculum Importance */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                Weight: {(w.w3_criticality * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                FACTOR 03
              </span>
              <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                Topic Importance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How many future topics rely on this concept as a prerequisite.
              </p>
            </div>

            {/* Gauge */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-600 font-medium">Importance Score:</span>
                <span className="font-mono font-bold text-base text-indigo-700">
                  <AnimatedCounter value={activeRec.criticality * 100} suffix="%" />
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-indigo-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(activeRec.criticality * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="text-slate-600 font-medium">Curriculum Role:</span>
                <span className="font-semibold text-slate-800">
                  Core Foundation
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Connected Topics:</span>
                <span className="font-semibold text-slate-800">{activeRec.downstream_count} topics</span>
              </div>
              <div className="flex justify-between">
                <span>Prerequisites:</span>
                <span className="font-semibold text-slate-800">{activeRec.prerequisites.length} topics</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Contribution:</span>
            <span className="font-bold text-indigo-700">
              +{term3.toFixed(2)} ({pct3}%)
            </span>
          </div>
        </motion.div>
      </div>

      {/* Fusion Formula Math Visualizer */}
      {/* How Priority is Calculated */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-lg text-on-surface">
            How Priority is Calculated
          </h3>
        </div>

        {/* Formula Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-800 space-y-1.5">
          <div className="text-slate-600 font-medium">
            Priority = Skill Gap ({pct1}%) + Memory Need ({pct2}%) + Topic Importance ({pct3}%)
          </div>
          <div className="text-primary font-bold text-base pt-0.5">
            Recommendation Priority: {totalScore.toFixed(2)}
          </div>
        </div>

        {/* Contribution Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Score Composition</span>
            <span>100% Total</span>
          </div>
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100">
            <motion.div
              style={{ width: `${pct1}%` }}
              className="bg-primary flex items-center justify-center text-[10px] text-white font-bold"
              initial={{ width: 0 }}
              animate={{ width: `${pct1}%` }}
              transition={{ duration: 0.6 }}
            >
              {pct1}%
            </motion.div>
            <motion.div
              style={{ width: `${pct2}%` }}
              className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold"
              initial={{ width: 0 }}
              animate={{ width: `${pct2}%` }}
              transition={{ duration: 0.6 }}
            >
              {pct2}%
            </motion.div>
            <motion.div
              style={{ width: `${pct3}%` }}
              className="bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold"
              initial={{ width: 0 }}
              animate={{ width: `${pct3}%` }}
              transition={{ duration: 0.6 }}
            >
              {pct3}%
            </motion.div>
          </div>
          <div className="flex flex-wrap justify-between text-[11px] text-slate-500 pt-1 gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Skill Gap ({pct1}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Memory Need ({pct2}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> Topic Importance ({pct3}%)
            </span>
          </div>
        </div>
      </div>

      {/* Downstream Concepts Impact Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Topics Unlocked by This Concept
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {activeRec.downstream_count} Connected Topics
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Mastering '{activeRec.name}' directly helps you understand these connected topics:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {activeRec.downstream_concepts.map((dc) => (
            <motion.div
              key={dc.concept_id}
              whileHover={{ scale: 1.01 }}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {dc.concept_id.toUpperCase()}
                </span>
                <h5 className="text-xs font-bold text-on-surface">
                  {dc.name}
                </h5>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                dc.is_direct ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-700'
              }`}>
                {dc.is_direct ? 'Next Step' : 'Connected'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

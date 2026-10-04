import React, { useState, useEffect, useMemo } from 'react';
import { ProgressResponse, StudentSummary } from '../types';
import { fetchConceptProgress, fetchConcepts } from '../api/client';
import { 
  TrendingDown, 
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface ProgressRetentionProps {
  student: StudentSummary | null;
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ProgressRetention: React.FC<ProgressRetentionProps> = ({
  student,
  selectedConceptId,
  onSelectConcept,
  onNavigateTab,
}) => {
  const [conceptList, setConceptList] = useState<Array<{ concept_id: string; name: string }>>([]);
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeConceptId, setActiveConceptId] = useState<string>(selectedConceptId || 'c03');

  useEffect(() => {
    fetchConcepts().then(data => {
      setConceptList(data.map(c => ({ concept_id: c.concept_id, name: c.name })));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedConceptId) {
      setActiveConceptId(selectedConceptId);
    }
  }, [selectedConceptId]);

  useEffect(() => {
    if (!student || !activeConceptId) return;
    setLoading(true);
    fetchConceptProgress(student.student_id, activeConceptId)
      .then(res => setProgressData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [student, activeConceptId]);

  const trajectory = progressData?.trajectory || [];

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 320;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Compute SVG path coordinates
  const { pathD, projectedPathD, eventPoints } = useMemo(() => {
    if (trajectory.length === 0) return { pathD: '', projectedPathD: '', eventPoints: [] };

    const n = trajectory.length;
    let mainPath = '';
    let projPath = '';
    const events: Array<{ x: number; y: number; event: string; date: string; recall: number }> = [];

    let hasStartedProjected = false;

    trajectory.forEach((pt, idx) => {
      const x = padLeft + (idx / (n - 1)) * chartW;
      const y = padTop + chartH - (pt.recall_probability * chartH);

      if (!pt.is_projected) {
        if (idx === 0) {
          mainPath += `M ${x} ${y}`;
        } else {
          mainPath += ` L ${x} ${y}`;
        }
      } else {
        if (!hasStartedProjected) {
          const prevPt = trajectory[idx - 1];
          const prevX = padLeft + ((idx - 1) / (n - 1)) * chartW;
          const prevY = padTop + chartH - (prevPt.recall_probability * chartH);
          projPath += `M ${prevX} ${prevY} L ${x} ${y}`;
          hasStartedProjected = true;
        } else {
          projPath += ` L ${x} ${y}`;
        }
      }

      if (pt.event && pt.event !== 'Not Started') {
        events.push({ x, y, event: pt.event, date: pt.date, recall: pt.recall_probability });
      }
    });

    return { pathD: mainPath, projectedPathD: projPath, eventPoints: events };
  }, [trajectory]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Header & Concept Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 tracking-wider uppercase mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-primary" />
            Retention Tracker
          </div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">
            Memory Review
          </h1>
          <p className="text-sm text-secondary mt-1">
            Track how well you remember each topic and when it's best to practice.
          </p>
        </div>

        {/* Concept Dropdown */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Topic:</span>
          <select
            value={activeConceptId}
            onChange={(e) => {
              setActiveConceptId(e.target.value);
              onSelectConcept(e.target.value);
            }}
            className="text-xs font-semibold text-on-surface bg-transparent focus:outline-none cursor-pointer py-1"
          >
            {conceptList.map(c => (
              <option key={c.concept_id} value={c.concept_id}>
                {c.concept_id.toUpperCase()} • {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : progressData ? (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Current Memory</span>
              <div className="text-2xl font-headline font-bold text-on-surface flex items-baseline gap-1.5 mt-1">
                <AnimatedCounter value={progressData.current_recall * 100} suffix="%" />
                <span className={`text-xs font-semibold ${
                  progressData.current_recall < 0.6 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {progressData.current_recall < 0.6 ? 'Needs Review' : 'Good'}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Memory Strength</span>
              <div className="text-2xl font-headline font-bold text-amber-600 mt-1">
                <AnimatedCounter value={progressData.half_life_days} decimals={1} suffix=" Days" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Days Since Review</span>
              <div className="text-2xl font-headline font-bold text-slate-700 mt-1">
                <AnimatedCounter value={progressData.elapsed_days} decimals={1} suffix=" Days" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Mastery Level</span>
              <div className="text-2xl font-headline font-bold text-primary mt-1">
                <AnimatedCounter value={progressData.current_mastery * 100} suffix="%" />
              </div>
            </div>
          </div>

          {/* Prominent SVG Retention Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Memory Timeline: {progressData.concept_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Green dots show practice sessions. The dashed line shows projected memory if not reviewed.
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectConcept(progressData.concept_id);
                  onNavigateTab('quiz');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl transition-all self-start sm:self-auto shadow-xs cursor-pointer hover:-translate-y-0.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Practice Quiz</span>
              </button>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-x-auto pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px] select-none">
                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
                  const y = padTop + chartH - v * chartH;
                  return (
                    <g key={v}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {Math.round(v * 100)}%
                      </text>
                    </g>
                  );
                })}

                {/* 60% Critical Threshold Warning Line */}
                <line
                  x1={padLeft}
                  y1={padTop + chartH - 0.6 * chartH}
                  x2={svgWidth - padRight}
                  y2={padTop + chartH - 0.6 * chartH}
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - padRight - 5}
                  y={padTop + chartH - 0.6 * chartH - 4}
                  textAnchor="end"
                  className="text-[9px] fill-rose-500 font-semibold"
                >
                  Critical Threshold (60%)
                </text>

                {/* Historical Observed Curve with motion reveal */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#00685f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                {/* Projected Decay Curve */}
                {projectedPathD && (
                  <path
                    d={projectedPathD}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                  />
                )}

                {/* Event Markers (Practice Sessions) */}
                {eventPoints.map((ev, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={ev.x}
                      cy={ev.y}
                      r="5.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125 shadow-xs"
                    />
                    <text
                      x={ev.x}
                      y={ev.y - 10}
                      textAnchor="middle"
                      className="text-[9px] fill-emerald-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {ev.date}
                    </text>
                  </g>
                ))}

                {/* Current Time Indicator Line */}
                <line
                  x1={padLeft + (90 / (90 + 14)) * chartW}
                  y1={padTop}
                  x2={padLeft + (90 / (90 + 14)) * chartW}
                  y2={padTop + chartH}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={padLeft + (90 / (90 + 14)) * chartW}
                  y={padTop + chartH + 20}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-600 font-bold"
                >
                  Today (Day 90)
                </text>

                {/* Timeline axis labels */}
                <text x={padLeft} y={padTop + chartH + 20} textAnchor="start" className="text-[10px] fill-slate-400">
                  Day 0
                </text>
                <text x={svgWidth - padRight} y={padTop + chartH + 20} textAnchor="end" className="text-[10px] fill-slate-400">
                  +14d Forecast
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-primary" /> Past Memory
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-500 border-dashed" /> 14-Day Projection
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Practice Session
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Spaced Revision Engine
              </span>
            </div>
          </div>

          {/* Educational Explainability Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-primary" />
                How Memory Review Works
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every time you review a topic, your memory lasts longer. Doing quick practices at spaced intervals helps store what you've learned into permanent memory.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                When to Review
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practicing right when your memory score begins to drop gives you the highest learning benefit with the least effort.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
};

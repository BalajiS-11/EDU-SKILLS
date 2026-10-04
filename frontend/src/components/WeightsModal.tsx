import React, { useState, useEffect } from 'react';
import { WeightsConfig } from '../types';
import { Sliders, X, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeights: WeightsConfig;
  onSave: (weights: WeightsConfig) => Promise<void>;
}

export const WeightsModal: React.FC<WeightsModalProps> = ({
  isOpen,
  onClose,
  currentWeights,
  onSave,
}) => {
  const [w1, setW1] = useState(currentWeights.w1_mastery);
  const [w2, setW2] = useState(currentWeights.w2_recall);
  const [w3, setW3] = useState(currentWeights.w3_criticality);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setW1(currentWeights.w1_mastery);
    setW2(currentWeights.w2_recall);
    setW3(currentWeights.w3_criticality);
  }, [currentWeights]);

  if (!isOpen) return null;

  const total = w1 + w2 + w3 || 1.0;
  const normW1 = w1 / total;
  const normW2 = w2 / total;
  const normW3 = w3 / total;

  const handleReset = () => {
    setW1(0.33);
    setW2(0.33);
    setW3(0.34);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        w1_mastery: parseFloat(normW1.toFixed(3)),
        w2_recall: parseFloat(normW2.toFixed(3)),
        w3_criticality: parseFloat(normW3.toFixed(3)),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 select-none"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Study Preferences
                </h3>
                <p className="text-xs text-secondary">
                  Customize how EDU SKILL chooses your topics.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-5 space-y-5">
            {/* Signal 1: Skill Gap */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Skill Gap Focus
                </span>
                <span className="font-mono font-bold text-primary">
                  <AnimatedCounter value={normW1 * 100} suffix="%" />
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w1}
                onChange={(e) => setW1(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary transition-all"
              />
              <span className="text-[11px] text-slate-500">
                Prioritizes topics where you need more practice
              </span>
            </div>

            {/* Signal 2: Memory Retention */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Memory Review Focus
                </span>
                <span className="font-mono font-bold text-amber-600">
                  <AnimatedCounter value={normW2 * 100} suffix="%" />
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
              />
              <span className="text-[11px] text-slate-500">
                Prioritizes topics that haven't been reviewed recently
              </span>
            </div>

            {/* Signal 3: Core Foundation */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Core Foundation Focus
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  <AnimatedCounter value={normW3 * 100} suffix="%" />
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w3}
                onChange={(e) => setW3(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all"
              />
              <span className="text-[11px] text-slate-500">
                Prioritizes key prerequisites that unlock new lessons
              </span>
            </div>

            {/* Allocation Bar */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Focus Distribution</span>
                <span>100% Total</span>
              </div>
              <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100">
                <motion.div
                  style={{ width: `${normW1 * 100}%` }}
                  className="bg-primary"
                  animate={{ width: `${normW1 * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  title={`Skill Gap: ${Math.round(normW1 * 100)}%`}
                />
                <motion.div
                  style={{ width: `${normW2 * 100}%` }}
                  className="bg-amber-500"
                  animate={{ width: `${normW2 * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  title={`Memory: ${Math.round(normW2 * 100)}%`}
                />
                <motion.div
                  style={{ width: `${normW3 * 100}%` }}
                  className="bg-indigo-600"
                  animate={{ width: `${normW3 * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  title={`Foundation: ${Math.round(normW3 * 100)}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="text-teal-700 font-semibold">Skill Gap ({Math.round(normW1 * 100)}%)</span>
                <span className="text-amber-700 font-semibold">Memory ({Math.round(normW2 * 100)}%)</span>
                <span className="text-indigo-700 font-semibold">Foundation ({Math.round(normW3 * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-xl shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  StudentSummary, 
  ConceptCatalogItem, 
  PracticeQuestion, 
  AttemptResult 
} from '../types';
import { fetchConcepts, submitAttempt } from '../api/client';
import { 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface PracticeQuizProps {
  student: StudentSummary | null;
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => Promise<void>;
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({
  student,
  selectedConceptId,
  onSelectConcept,
  onNavigateTab,
  onRefreshData,
}) => {
  const [concepts, setConcepts] = useState<ConceptCatalogItem[]>([]);
  const [activeConceptId, setActiveConceptId] = useState<string>(selectedConceptId || 'c08');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(18);
  const isSubmittingOrSubmitted = React.useRef<boolean>(false);

  // Session stats to fill dead space meaningfully
  const [sessionStreak, setSessionStreak] = useState<number>(2);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(3);
  const [sessionTotalCount, setSessionTotalCount] = useState<number>(3);

  useEffect(() => {
    fetchConcepts().then(res => {
      setConcepts(res);
      if (!selectedConceptId && res.length > 0) {
        setActiveConceptId(res[0].concept_id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedConceptId && !isSubmittingOrSubmitted.current) {
      setActiveConceptId(selectedConceptId);
      setQuestionIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setAttemptResult(null);
    }
  }, [selectedConceptId]);

  const activeConcept = concepts.find(c => c.concept_id === activeConceptId) || concepts[0];
  const questions = activeConcept?.questions || [];
  const currentQ: PracticeQuestion | undefined = questions[questionIndex] || questions[0];

  const handleSubmit = async (overrideCorrect?: number) => {
    if (!student || !activeConcept || !currentQ) return;
    if (selectedOption === null && overrideCorrect === undefined) return;

    isSubmittingOrSubmitted.current = true;
    setLoading(true);
    const isCorrect = overrideCorrect !== undefined 
      ? overrideCorrect 
      : (selectedOption === currentQ.correct_index ? 1 : 0);

    if (overrideCorrect !== undefined) {
      setSelectedOption(overrideCorrect === 1 ? currentQ.correct_index : (currentQ.correct_index + 1) % currentQ.options.length);
    }

    try {
      const res = await submitAttempt(
        student.student_id,
        activeConcept.concept_id,
        isCorrect,
        elapsedSeconds
      );
      setAttemptResult(res);
      setIsSubmitted(true);

      // Update session metrics
      setSessionTotalCount(prev => prev + 1);
      if (isCorrect === 1) {
        setSessionCorrectCount(prev => prev + 1);
        setSessionStreak(prev => prev + 1);
      } else {
        setSessionStreak(0);
      }

      await onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    isSubmittingOrSubmitted.current = false;
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setQuestionIndex(0);
    }
    setSelectedOption(null);
    setIsSubmitted(false);
    setAttemptResult(null);
    setElapsedSeconds(16);
  };

  const sessionAccuracy = Math.round((sessionCorrectCount / Math.max(sessionTotalCount, 1)) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Quick Practice
          </div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">
            Practice Quiz
          </h1>
          <p className="text-sm text-secondary mt-1">
            Answer questions to test your skills and lock knowledge into memory.
          </p>
        </div>

        {/* Concept Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Topic:</span>
          <select
            value={activeConceptId}
            onChange={(e) => {
              isSubmittingOrSubmitted.current = false;
              setActiveConceptId(e.target.value);
              onSelectConcept(e.target.value);
              setQuestionIndex(0);
              setSelectedOption(null);
              setIsSubmitted(false);
              setAttemptResult(null);
            }}
            className="text-xs font-semibold text-on-surface bg-transparent focus:outline-none cursor-pointer py-1"
          >
            {concepts.map(c => (
              <option key={c.concept_id} value={c.concept_id}>
                {c.concept_id.toUpperCase()} • {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeConcept && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase">
                {activeConcept.module}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {activeConcept.name}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Timer className="w-3.5 h-3.5 text-primary" />
                {elapsedSeconds}s
              </span>
              <span>
                Question {questionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Question
            </span>
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface leading-snug">
              {currentQ.prompt}
            </h3>
          </div>

          {/* Options with smooth selection transition */}
          <div className="space-y-3 pt-1">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQ.correct_index;

              let optionClasses = "p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ";
              
              if (!isSubmitted) {
                if (isSelected) {
                  optionClasses += "border-primary bg-teal-50/70 text-primary ring-2 ring-primary/20 shadow-xs";
                } else {
                  optionClasses += "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-800";
                }
              } else {
                if (isCorrectOption) {
                  optionClasses += "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-200";
                } else if (isSelected && !isCorrectOption) {
                  optionClasses += "border-rose-500 bg-rose-50 text-rose-950 line-through";
                } else {
                  optionClasses += "border-slate-200 opacity-50 text-slate-500";
                }
              }

              return (
                <motion.div
                  key={idx}
                  whileHover={!isSubmitted ? { scale: 1.008 } : undefined}
                  whileTap={!isSubmitted ? { scale: 0.995 } : undefined}
                  onClick={() => !isSubmitted && setSelectedOption(idx)}
                  className={optionClasses}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected && !isSubmitted
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </motion.div>
                  )}
                  {isSubmitted && isSelected && !isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          {!isSubmitted ? (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              {/* Quick simulation buttons */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Quick Test:</span>
                <button
                  type="button"
                  onClick={() => handleSubmit(1)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                >
                  Simulate Correct
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(0)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  Simulate Incorrect
                </button>
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={selectedOption === null || loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-container disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {loading ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          ) : (
            /* Live Feedback Loop Outcome Card */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 pt-4 border-t border-slate-100"
            >
              {/* Outcome Banner */}
              <div className={`p-4 rounded-xl flex items-start gap-3.5 ${
                selectedOption === currentQ.correct_index
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}>
                {selectedOption === currentQ.correct_index ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {selectedOption === currentQ.correct_index
                      ? 'Great job! Your memory score has increased.'
                      : 'Needs review! Check the explanation below:'}
                  </h4>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              {/* Dynamic Feedback Loop Demonstration Card */}
              {attemptResult && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Progress Updated in Real-Time
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">New Mastery</span>
                      <span className="text-lg font-bold text-teal-700 font-headline">
                        <AnimatedCounter value={attemptResult.new_mastery * 100} suffix="%" />
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">Memory Score</span>
                      <span className="text-lg font-bold text-amber-600 font-headline">
                        <AnimatedCounter value={attemptResult.new_recall_probability * 100} suffix="%" />
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">Priority Score</span>
                      <span className="text-lg font-bold text-slate-800 font-headline">
                        <AnimatedCounter value={attemptResult.new_priority} decimals={2} />
                      </span>
                    </div>
                  </div>

                  {attemptResult.top_recommendation && (
                    <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                          Next Recommended Topic
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {attemptResult.top_recommendation.name} (Priority {attemptResult.top_recommendation.priority.toFixed(2)})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectConcept(attemptResult.top_recommendation!.concept_id);
                          onNavigateTab('dashboard');
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer"
                      >
                        <span>View on Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Next Question
                </button>

                <button
                  onClick={() => onNavigateTab('dashboard')}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Session Progress Strip */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Target className="w-4 h-4 text-primary" />
            Study Stats
          </div>
          <span className="text-xs text-slate-400">Class 10 Math</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak Counter */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">
                Streak
              </span>
              <div className="text-lg font-bold font-headline text-on-surface">
                <AnimatedCounter value={sessionStreak} suffix=" in a row" />
              </div>
            </div>
          </div>

          {/* Running Session Accuracy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">
                Session Accuracy
              </span>
              <div className="text-lg font-bold font-headline text-on-surface">
                <AnimatedCounter value={sessionAccuracy} suffix="%" />
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({sessionCorrectCount}/{sessionTotalCount})
                </span>
              </div>
            </div>
          </div>

          {/* Cognitive Retention Tip */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide block">
                Study Tip
              </span>
              <p className="text-xs text-indigo-700 leading-snug">
                Active practice testing produces 2.5× higher long-term memory than passive re-reading.
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

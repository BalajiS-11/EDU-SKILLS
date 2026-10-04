import React, { useState, useMemo } from 'react';
import { ConceptGraphResponse, GraphNode } from '../types';
import { 
  Network, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowRight, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface ConceptMapProps {
  graphData: ConceptGraphResponse | null;
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onNavigateTab: (tab: string) => void;
}

// 9 topological curriculum columns (levels 0 to 8)
const MODULE_LEVELS: Record<string, number> = {
  "c01": 0,
  "c02": 1, "c03": 1, "c04": 1, "c06": 1,
  "c05": 2, "c07": 2, "c11": 2, "c12": 2, "c21": 2,
  "c08": 3, "c09": 3, "c13": 3, "c22": 3,
  "c10": 4, "c14": 4, "c20": 4, "c23": 4,
  "c15": 5, "c16": 5, "c24": 5,
  "c17": 6, "c19": 6,
  "c18": 7,
  "c25": 8
};

export const ConceptMap: React.FC<ConceptMapProps> = ({
  graphData,
  selectedConceptId,
  onSelectConcept,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(selectedConceptId || 'c14');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Responsive coordinates calibrated for a 1050x580 viewBox
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const colBuckets: Record<number, string[]> = {};

    nodes.forEach(n => {
      const lvl = MODULE_LEVELS[n.id] ?? 3;
      if (!colBuckets[lvl]) colBuckets[lvl] = [];
      colBuckets[lvl].push(n.id);
    });

    const startX = 65;
    const endX = 985;
    const colStep = (endX - startX) / 8; // ~115px between columns
    const totalHeight = 520;

    Object.entries(colBuckets).forEach(([colStr, cids]) => {
      const col = parseInt(colStr, 10);
      const count = cids.length;
      const stepY = totalHeight / (count + 1);

      cids.forEach((cid, idx) => {
        pos[cid] = {
          x: Math.round(startX + col * colStep),
          y: Math.round(30 + (idx + 1) * stepY)
        };
      });
    });

    return pos;
  }, [nodes]);

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMod = selectedModule === 'ALL' || n.module === selectedModule;
      return matchSearch && matchMod;
    });
  }, [nodes, searchQuery, selectedModule]);

  const modulesList = useMemo(() => {
    return Array.from(new Set(nodes.map(n => n.module)));
  }, [nodes]);

  const getNodeColor = (n: GraphNode) => {
    if (n.status === 'mastered') return { bg: '#ecfdf5', border: '#10b981', text: '#065f46', fill: '#10b981' };
    if (n.status === 'decaying') return { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', fill: '#f59e0b' };
    if (n.status === 'learning') return { bg: '#fff1f2', border: '#f43f5e', text: '#9f1239', fill: '#f43f5e' };
    return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', fill: '#94a3b8' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 max-w-7xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 tracking-wider uppercase mb-1">
            <Network className="w-3.5 h-3.5 text-primary" />
            Curriculum Map
          </div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">
            Topic Map
          </h1>
          <p className="text-sm text-secondary mt-1">
            Explore all 25 topics and see how skills connect together.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Needs Review
          </span>
          <span className="flex items-center gap-1.5 text-rose-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Learning
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Not Started
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="py-1.5 px-3 rounded-xl text-xs border border-slate-200 text-slate-700 bg-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Modules ({nodes.length})</option>
            {modulesList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Responsive Canvas & DOCKED (Non-overlapping) Details Drawer */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Responsive Reflowing SVG Graph Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 overflow-hidden relative select-none">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.15s ease-out',
              width: '100%',
              minHeight: '560px',
            }}
          >
            <svg 
              viewBox="0 0 1050 580" 
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#00685f" />
                </marker>
              </defs>

              {/* Render Directed Edges */}
              {edges.map((e, idx) => {
                const sourcePos = nodePositions[e.source];
                const targetPos = nodePositions[e.target];
                if (!sourcePos || !targetPos) return null;

                const isConnectedToActive = e.source === activeNodeId || e.target === activeNodeId;
                const isIncomingToActive = e.target === activeNodeId;

                return (
                  <path
                    key={idx}
                    d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 45} ${sourcePos.y}, ${targetPos.x - 45} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                    fill="none"
                    stroke={isConnectedToActive ? '#00685f' : '#e2e8f0'}
                    strokeWidth={isConnectedToActive ? 2.5 : 1.2}
                    strokeDasharray={isConnectedToActive && isIncomingToActive ? '4 2' : 'none'}
                    markerEnd={isConnectedToActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                    className="transition-colors duration-200"
                  />
                );
              })}

              {/* Render Nodes */}
              {nodes.map((n) => {
                const pos = nodePositions[n.id];
                if (!pos) return null;

                const isSelected = n.id === activeNodeId;
                const isFiltered = filteredNodes.some(fn => fn.id === n.id);
                const color = getNodeColor(n);
                const radius = 18 + Math.round(n.criticality * 7);

                return (
                  <g
                    key={n.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => {
                      setActiveNodeId(n.id);
                      onSelectConcept(n.id);
                      setIsPanelOpen(true);
                    }}
                    className="cursor-pointer group"
                    opacity={isFiltered ? 1 : 0.25}
                  >
                    {/* Criticality glowing ring */}
                    {n.criticality > 0.6 && (
                      <circle
                        r={radius + 4}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="opacity-60 animate-pulse"
                      />
                    )}

                    {/* Active highlight */}
                    {isSelected && (
                      <circle
                        r={radius + 6}
                        fill="none"
                        stroke="#00685f"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main node circle */}
                    <circle
                      r={radius}
                      fill={color.bg}
                      stroke={isSelected ? '#00685f' : color.border}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                      className="transition-all duration-200 group-hover:scale-110 shadow-xs"
                    />

                    {/* Node ID label inside */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      className="text-[10px] font-mono font-bold select-none"
                      fill={color.text}
                    >
                      {n.id.toUpperCase()}
                    </text>

                    {/* Name caption below node */}
                    <text
                      textAnchor="middle"
                      dy={radius + 12}
                      className={`text-[9px] font-semibold select-none ${
                        isSelected ? 'fill-primary font-bold' : 'fill-slate-700'
                      }`}
                    >
                      {n.name.length > 15 ? `${n.name.slice(0, 13)}...` : n.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Concept Inspector Sidebar — Gracefully Docked side-by-side */}
        <AnimatePresence>
          {isPanelOpen && activeNode && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between shrink-0"
            >
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-primary bg-teal-50 px-2.5 py-0.5 rounded-md">
                      {activeNode.id.toUpperCase()}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      activeNode.status === 'mastered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : activeNode.status === 'decaying'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {activeNode.status}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {activeNode.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeNode.module} • Difficulty: {Math.round(activeNode.difficulty * 10)}/10
                  </span>
                </div>

                {/* 3 Metric Summary in Inspector */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Mastery:</span>
                      <span className="font-mono font-bold text-primary">
                        <AnimatedCounter value={activeNode.mastery * 100} suffix="%" />
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(activeNode.mastery * 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Memory Score:</span>
                      <span className="font-mono font-bold text-amber-600">
                        <AnimatedCounter value={activeNode.recall_probability * 100} suffix="%" />
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-amber-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(activeNode.recall_probability * 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Importance:</span>
                      <span className="font-mono font-bold text-indigo-700">
                        <AnimatedCounter value={activeNode.criticality * 100} suffix="%" />
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-indigo-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(activeNode.criticality * 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Downstream Count */}
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                  <span>Connected Topics:</span>
                  <span className="font-bold text-sm text-indigo-700">
                    <AnimatedCounter value={activeNode.downstream_count} suffix=" topics" />
                  </span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-6 space-y-2">
                <button
                  onClick={() => {
                    onSelectConcept(activeNode.id);
                    onNavigateTab('quiz');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-container shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Practice Topic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectConcept(activeNode.id);
                    onNavigateTab('progress');
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  View Memory Chart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

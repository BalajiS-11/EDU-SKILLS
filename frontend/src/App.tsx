import React, { useState, useEffect, useCallback } from 'react';
import { 
  StudentSummary, 
  RecommendationResponse, 
  ConceptGraphResponse, 
  WeightsConfig 
} from './types';
import { 
  fetchStudents, 
  fetchRecommendation, 
  fetchConceptGraph, 
  fetchWeights, 
  updateWeights 
} from './api/client';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WeightsModal } from './components/WeightsModal';
import { DashboardSkeleton } from './components/SkeletonLoader';
import { Dashboard } from './pages/Dashboard';
import { RecommendationDetail } from './pages/RecommendationDetail';
import { ConceptMap } from './pages/ConceptMap';
import { ProgressRetention } from './pages/ProgressRetention';
import { PracticeQuiz } from './pages/PracticeQuiz';
import { AnimatePresence, motion } from 'framer-motion';

export const App: React.FC = () => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [graphData, setGraphData] = useState<ConceptGraphResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [weights, setWeights] = useState<WeightsConfig>({
    w1_mastery: 0.33,
    w2_recall: 0.33,
    w3_criticality: 0.34,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial students and weights
  useEffect(() => {
    async function init() {
      try {
        const [studentList, currentWeights] = await Promise.all([
          fetchStudents(),
          fetchWeights()
        ]);
        setStudents(studentList);
        setWeights(currentWeights);
        if (studentList.length > 0) {
          setSelectedStudent(studentList[0]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, []);

  // Reload recommendations & graph when student changes
  const loadStudentData = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const [recs, graph] = await Promise.all([
        fetchRecommendation(studentId),
        fetchConceptGraph(studentId),
      ]);
      setRecommendations(recs);
      setGraphData(graph);
      if (recs.recommendations.length > 0 && activeTab !== 'quiz') {
        setSelectedConceptId(recs.recommendations[0].concept_id);
      }
    } catch (err) {
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData(selectedStudent.student_id);
    }
  }, [selectedStudent, loadStudentData]);

  const handleRefreshData = async () => {
    if (selectedStudent) {
      await loadStudentData(selectedStudent.student_id);
    }
  };

  const handleSaveWeights = async (newWeights: WeightsConfig) => {
    const updated = await updateWeights(newWeights);
    setWeights(updated);
    if (selectedStudent) {
      await loadStudentData(selectedStudent.student_id);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Slim Top Header */}
      <Navbar
        students={students}
        selectedStudent={selectedStudent}
        onSelectStudent={setSelectedStudent}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        onNavigateHome={() => setActiveTab('dashboard')}
      />

      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Viewport */}
      <div 
        className={`flex-1 transition-all duration-300 pt-16 ${
          sidebarCollapsed ? 'pl-18' : 'pl-64'
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {loading && !recommendations ? (
            <DashboardSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <Dashboard
                  key="dashboard"
                  student={selectedStudent}
                  recommendations={recommendations}
                  loading={loading}
                  onSelectConcept={setSelectedConceptId}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'recommendation' && (
                <RecommendationDetail
                  key="recommendation"
                  recommendations={recommendations}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={setSelectedConceptId}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'concept-map' && (
                <ConceptMap
                  key="concept-map"
                  graphData={graphData}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={setSelectedConceptId}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressRetention
                  key="progress"
                  student={selectedStudent}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={setSelectedConceptId}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'quiz' && (
                <PracticeQuiz
                  key="quiz"
                  student={selectedStudent}
                  selectedConceptId={selectedConceptId}
                  onSelectConcept={setSelectedConceptId}
                  onNavigateTab={setActiveTab}
                  onRefreshData={handleRefreshData}
                />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Weights Tuner Modal */}
      <WeightsModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        currentWeights={weights}
        onSave={handleSaveWeights}
      />
    </div>
  );
};

export default App;

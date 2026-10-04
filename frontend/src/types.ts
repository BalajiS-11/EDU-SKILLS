export interface StudentSummary {
  student_id: string;
  name: string;
  ability: number;
  review_frequency: number;
  total_attempts: number;
  overall_accuracy: number;
  overall_mastery: number;
}

export interface ConceptRecommendation {
  concept_id: string;
  name: string;
  module: string;
  difficulty: number;
  mastery: number;
  mastery_gap: number;
  recall_probability: number;
  forgetting_risk: number;
  criticality: number;
  priority: number;
  status: 'mastered' | 'learning' | 'decaying' | 'unattempted';
  half_life_days: number;
  elapsed_days: number;
  last_attempt_time: string | null;
  total_attempts: number;
  downstream_count: number;
  downstream_concepts: Array<{ concept_id: string; name: string; is_direct: boolean }>;
  prerequisites: Array<{ concept_id: string; name: string }>;
  reason: string;
  weights: { w1_mastery: number; w2_recall: number; w3_criticality: number };
}

export interface RecommendationResponse {
  student_id: string;
  student_name: string;
  generated_at: string;
  weights: { w1_mastery: number; w2_recall: number; w3_criticality: number };
  recommendations: ConceptRecommendation[];
}

export interface GraphNode {
  id: string;
  name: string;
  module: string;
  difficulty: number;
  mastery: number;
  recall_probability: number;
  criticality: number;
  priority: number;
  status: string;
  downstream_count: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ConceptGraphResponse {
  student_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ProgressPoint {
  date: string;
  recall_probability: number;
  is_projected: boolean;
  event?: string;
  half_life_days?: number;
  elapsed_days?: number;
}

export interface ProgressResponse {
  student_id: string;
  concept_id: string;
  concept_name: string;
  current_recall: number;
  current_mastery: number;
  half_life_days: number;
  elapsed_days: number;
  criticality: number;
  trajectory: ProgressPoint[];
}

export interface PracticeQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface ConceptCatalogItem {
  concept_id: string;
  name: string;
  module: string;
  difficulty: number;
  prerequisites: string[];
  criticality: number;
  downstream_count: number;
  questions: PracticeQuestion[];
}

export interface AttemptResult {
  success: boolean;
  message: string;
  student_id: string;
  concept_id: string;
  new_mastery: number;
  new_recall_probability: number;
  new_priority: number;
  top_recommendation?: ConceptRecommendation;
}

export interface WeightsConfig {
  w1_mastery: number;
  w2_recall: number;
  w3_criticality: number;
}

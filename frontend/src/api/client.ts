import {
  StudentSummary,
  RecommendationResponse,
  ConceptGraphResponse,
  ProgressResponse,
  ConceptCatalogItem,
  AttemptResult,
  WeightsConfig
} from '../types';

// In production, uses VITE_API_BASE_URL if set; otherwise relative path '' (unified deployment), or localhost in dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

export async function fetchStudents(): Promise<StudentSummary[]> {
  const res = await fetch(`${API_BASE_URL}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchRecommendation(studentId: string, topK: number = 3): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/recommendation?top_k=${topK}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations for ${studentId}`);
  return res.json();
}

export async function fetchConceptGraph(studentId: string): Promise<ConceptGraphResponse> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/concept-graph`);
  if (!res.ok) throw new Error(`Failed to fetch concept graph for ${studentId}`);
  return res.json();
}

export async function fetchConceptProgress(studentId: string, conceptId: string): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/progress/${conceptId}`);
  if (!res.ok) throw new Error(`Failed to fetch progress for concept ${conceptId}`);
  return res.json();
}

export async function submitAttempt(
  studentId: string,
  conceptId: string,
  correct: number,
  responseTimeSeconds: number
): Promise<AttemptResult> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept_id: conceptId,
      correct,
      response_time_seconds: responseTimeSeconds
    })
  });
  if (!res.ok) throw new Error('Failed to submit attempt');
  return res.json();
}

export async function fetchConcepts(): Promise<ConceptCatalogItem[]> {
  const res = await fetch(`${API_BASE_URL}/concepts`);
  if (!res.ok) throw new Error('Failed to fetch concept catalog');
  return res.json();
}

export async function fetchWeights(): Promise<WeightsConfig> {
  const res = await fetch(`${API_BASE_URL}/config/weights`);
  if (!res.ok) throw new Error('Failed to fetch weights');
  return res.json();
}

export async function updateWeights(weights: WeightsConfig): Promise<WeightsConfig> {
  const res = await fetch(`${API_BASE_URL}/config/weights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weights)
  });
  if (!res.ok) throw new Error('Failed to update weights');
  return res.json();
}

"""
Pydantic schemas for RootCause API endpoints.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StudentSummary(BaseModel):
    student_id: str
    name: str
    ability: float
    review_frequency: float
    total_attempts: int
    overall_accuracy: float
    overall_mastery: float

class ConceptRecommendation(BaseModel):
    concept_id: str
    name: str
    module: str
    difficulty: float
    mastery: float
    mastery_gap: float
    recall_probability: float
    forgetting_risk: float
    criticality: float
    priority: float
    status: str
    half_life_days: float
    elapsed_days: float
    last_attempt_time: Optional[str]
    total_attempts: int
    downstream_count: int
    downstream_concepts: List[Dict[str, Any]]
    prerequisites: List[Dict[str, Any]]
    reason: str
    weights: Dict[str, float]

class RecommendationResponse(BaseModel):
    student_id: str
    student_name: str
    generated_at: str
    weights: Dict[str, float]
    recommendations: List[ConceptRecommendation]

class ConceptGraphNode(BaseModel):
    id: str
    name: str
    module: str
    difficulty: float
    mastery: float
    recall_probability: float
    criticality: float
    priority: float
    status: str
    downstream_count: int

class ConceptGraphEdge(BaseModel):
    source: str
    target: str

class ConceptGraphResponse(BaseModel):
    student_id: str
    nodes: List[ConceptGraphNode]
    edges: List[ConceptGraphEdge]

class ProgressPoint(BaseModel):
    date: str
    recall_probability: float
    is_projected: bool
    event: Optional[str] = None
    half_life_days: Optional[float] = None
    elapsed_days: Optional[float] = None

class ProgressResponse(BaseModel):
    student_id: str
    concept_id: str
    concept_name: str
    current_recall: float
    current_mastery: float
    half_life_days: float
    elapsed_days: float
    criticality: float
    trajectory: List[ProgressPoint]

class AttemptCreate(BaseModel):
    concept_id: str
    correct: int = Field(..., ge=0, le=1)
    response_time_seconds: float = Field(default=30.0, ge=1.0)
    timestamp: Optional[str] = None

class AttemptResponse(BaseModel):
    success: bool
    message: str
    student_id: str
    concept_id: str
    new_mastery: float
    new_recall_probability: float
    new_priority: float
    top_recommendation: Optional[ConceptRecommendation] = None

class WeightsConfig(BaseModel):
    w1_mastery: float = Field(0.33, ge=0.0, le=1.0)
    w2_recall: float = Field(0.33, ge=0.0, le=1.0)
    w3_criticality: float = Field(0.34, ge=0.0, le=1.0)

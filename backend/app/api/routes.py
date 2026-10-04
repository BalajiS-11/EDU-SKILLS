"""
FastAPI route definitions for RootCause recommender API.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.database import (
    get_db_connection,
    fetch_all_concepts,
    fetch_student_attempts,
    log_attempt
)
from app.models.graph import ConceptGraph
from app.models.bkt import BayesianKnowledgeTracing
from app.models.decay import HalfLifeDecayModel
from app.models.recommender import FusionRecommender, DEFAULT_W1, DEFAULT_W2, DEFAULT_W3
from app.schemas import (
    StudentSummary,
    ConceptRecommendation,
    RecommendationResponse,
    ConceptGraphResponse,
    ProgressResponse,
    AttemptCreate,
    AttemptResponse,
    WeightsConfig
)

router = APIRouter()

# Global singletons
_concepts = fetch_all_concepts()
_graph = ConceptGraph(_concepts)
_bkt = BayesianKnowledgeTracing()
_decay = HalfLifeDecayModel()
_recommender = FusionRecommender(_graph, _bkt, _decay)

# Curated interactive practice questions for the micro-quiz activity
PRACTICE_QUESTIONS: Dict[str, List[Dict[str, Any]]] = {
    "c01": [
        {"id": "q1", "prompt": "Which of the following numbers is an irrational number?", "options": ["3/4", "0.25", "√7", "-14"], "correct_index": 2, "explanation": "√7 cannot be expressed as a ratio of two integers and has a non-repeating decimal expansion."},
        {"id": "q2", "prompt": "What is the additive inverse of -5/8?", "options": ["8/5", "5/8", "-8/5", "1"], "correct_index": 1, "explanation": "The additive inverse of -x is +x so that -x + x = 0."}
    ],
    "c03": [
        {"id": "q1", "prompt": "Solve for x: 4(x - 3) = 2x + 6", "options": ["x = 6", "x = 9", "x = 3", "x = 12"], "correct_index": 1, "explanation": "4x - 12 = 2x + 6 => 2x = 18 => x = 9."},
        {"id": "q2", "prompt": "If 3x + 7 = 22, what is the value of 2x - 1?", "options": ["9", "11", "5", "7"], "correct_index": 0, "explanation": "3x = 15 => x = 5. Then 2(5) - 1 = 9."}
    ],
    "c08": [
        {"id": "q1", "prompt": "What is the slope of the line 3x + 2y = 12?", "options": ["3/2", "-3/2", "6", "-2/3"], "correct_index": 1, "explanation": "Rearrange to y = (-3/2)x + 6, so slope m = -3/2."},
        {"id": "q2", "prompt": "At what point does the line 2x - 5y = 10 intersect the x-axis?", "options": ["(0, -2)", "(5, 0)", "(2, 0)", "(-5, 0)"], "correct_index": 1, "explanation": "Set y = 0: 2x = 10 => x = 5. Point is (5, 0)."}
    ],
    "c10": [
        {"id": "q1", "prompt": "Solve the system: x + y = 10 and x - y = 4. What is the value of x * y?", "options": ["21", "24", "20", "28"], "correct_index": 0, "explanation": "Adding both gives 2x = 14 => x = 7. Then y = 3. Product is 7 * 3 = 21."},
        {"id": "q2", "prompt": "If a system has lines that are parallel and non-intersecting, how many solutions exist?", "options": ["Infinitely many", "Exactly one", "No solution", "Two solutions"], "correct_index": 2, "explanation": "Parallel distinct lines have no intersection, hence no solution."}
    ],
    "c13": [
        {"id": "q1", "prompt": "What is the factorization of x² - 9x + 20?", "options": ["(x - 4)(x - 5)", "(x - 2)(x - 10)", "(x + 4)(x + 5)", "(x - 1)(x - 20)"], "correct_index": 0, "explanation": "Find factors of 20 that sum to -9: (-4) and (-5)."},
        {"id": "q2", "prompt": "Factor completely: 4x² - 25y²", "options": ["(2x - 5y)²", "(4x - 5y)(x + 5y)", "(2x - 5y)(2x + 5y)", "2(x - 5y)(x + 5y)"], "correct_index": 2, "explanation": "Difference of squares: a² - b² = (a - b)(a + b)."}
    ],
    "c14": [
        {"id": "q1", "prompt": "Which of the following is the standard form of a quadratic equation?", "options": ["ax + by = c", "ax² + bx + c = 0 (a ≠ 0)", "y = mx + b", "a³ + b³ = c³"], "correct_index": 1, "explanation": "Standard form is ax² + bx + c = 0 where a, b, c are real numbers and a ≠ 0."},
        {"id": "q2", "prompt": "What are the roots of (x - 3)(x + 7) = 0?", "options": ["3 and 7", "-3 and -7", "3 and -7", "-3 and 7"], "correct_index": 2, "explanation": "Zero product property: x - 3 = 0 => x = 3; x + 7 = 0 => x = -7."}
    ],
    "c16": [
        {"id": "q1", "prompt": "What constant must be added to x² + 8x to make it a perfect square trinomial?", "options": ["8", "16", "64", "4"], "correct_index": 1, "explanation": "Add (b/2)² = (8/2)² = 4² = 16. The trinomial is (x + 4)²."},
        {"id": "q2", "prompt": "Completing the square on x² - 6x = 7 yields which equivalent equation?", "options": ["(x - 3)² = 16", "(x - 3)² = 7", "(x - 6)² = 43", "(x + 3)² = 16"], "correct_index": 0, "explanation": "Add (-6/2)² = 9 to both sides: x² - 6x + 9 = 7 + 9 => (x - 3)² = 16."}
    ],
    "c17": [
        {"id": "q1", "prompt": "For ax² + bx + c = 0, what is the quadratic formula?", "options": ["x = (-b ± √(b² - 4ac)) / (2a)", "x = (-b ± √(b² + 4ac)) / (2a)", "x = (b ± √(b² - 4ac)) / (2a)", "x = -b / (2a)"], "correct_index": 0, "explanation": "Standard quadratic formula: x = (-b ± √(b² - 4ac)) / 2a."},
        {"id": "q2", "prompt": "If b² - 4ac < 0, what can be deduced about the roots in the real number system?", "options": ["Two distinct real roots", "One repeated real root", "No real roots (two complex roots)", "Roots are zero"], "correct_index": 2, "explanation": "A negative discriminant inside the square root results in non-real complex conjugate roots."}
    ],
    "c21": [
        {"id": "q1", "prompt": "What is the common difference (d) of the AP: 7, 11, 15, 19, ...?", "options": ["3", "4", "5", "7"], "correct_index": 1, "explanation": "d = a₂ - a₁ = 11 - 7 = 4."},
        {"id": "q2", "prompt": "In an AP where a = 5 and d = 3, what is the 10th term (a₁₀)?", "options": ["32", "35", "38", "29"], "correct_index": 0, "explanation": "a₁₀ = a + (10 - 1)d = 5 + 9(3) = 5 + 27 = 32."}
    ]
}

# Fallback generic question generator for any concept
def get_questions_for_concept(cid: str, concept_name: str) -> List[Dict[str, Any]]:
    if cid in PRACTICE_QUESTIONS:
        return PRACTICE_QUESTIONS[cid]
    return [
        {
            "id": f"{cid}_q1",
            "prompt": f"In Class 10 Algebra, what is the fundamental prerequisite or rule defining '{concept_name}'?",
            "options": [
                "It requires satisfying foundational algebraic closure and properties.",
                "It only applies to non-linear transcendental equations.",
                "It can only be solved using geometric compass constructions.",
                "It has no dependency on real number axioms."
            ],
            "correct_index": 0,
            "explanation": f"Foundational algebraic definitions and prerequisites govern the properties of {concept_name}."
        },
        {
            "id": f"{cid}_q2",
            "prompt": f"When solving problems involving '{concept_name}', which step prevents common reasoning pitfalls?",
            "options": [
                "Skipping domain constraint verification.",
                "Systematically verifying intermediate equations and boundary values.",
                "Assuming all unknown roots are negative.",
                "Approximating all coefficients to integers."
            ],
            "correct_index": 1,
            "explanation": f"Checking domain constraints and steps guarantees correctness in {concept_name}."
        }
    ]

@router.get("/students", response_model=List[StudentSummary])
def list_students():
    """Returns all 20 students with summary metrics."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT student_id, name, ability, review_frequency FROM students ORDER BY student_id")
    students = cursor.fetchall()
    conn.close()

    summaries = []
    for s in students:
        s_id = s["student_id"]
        attempts_map = fetch_student_attempts(s_id)
        all_attempts = [a for atts in attempts_map.values() for a in atts]
        total_attempts = len(all_attempts)
        acc = sum(1 for a in all_attempts if a["correct"] == 1) / max(total_attempts, 1)

        # Estimate average mastery across practiced concepts
        concept_masteries = [
            _bkt.compute_mastery([a["correct"] for a in atts])
            for atts in attempts_map.values()
        ]
        avg_mastery = sum(concept_masteries) / max(len(concept_masteries), 1)

        summaries.append(StudentSummary(
            student_id=s_id,
            name=s["name"],
            ability=s["ability"],
            review_frequency=s["review_frequency"],
            total_attempts=total_attempts,
            overall_accuracy=round(acc, 3),
            overall_mastery=round(avg_mastery, 3)
        ))

    return summaries

@router.get("/students/{student_id}/recommendation", response_model=RecommendationResponse)
def get_recommendation(student_id: str, top_k: int = Query(default=3, ge=1, le=10)):
    """
    Returns top-k ranked concepts with full 3-signal breakdown
    (mastery %, recall %, criticality, final priority score, plain-language reason).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM students WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    student_name = row["name"]
    attempts_map = fetch_student_attempts(student_id)
    recs = _recommender.recommend(attempts_map, top_k=top_k)

    return RecommendationResponse(
        student_id=student_id,
        student_name=student_name,
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        weights={"w1_mastery": _recommender.w1, "w2_recall": _recommender.w2, "w3_criticality": _recommender.w3},
        recommendations=recs
    )

@router.get("/students/{student_id}/concept-graph", response_model=ConceptGraphResponse)
def get_concept_graph(student_id: str):
    """
    Returns nodes and edges for the prerequisite DAG with per-node mastery, recall, and priority.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT student_id FROM students WHERE student_id = ?", (student_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")
    conn.close()

    attempts_map = fetch_student_attempts(student_id)
    
    # Pre-calculate metrics for all concepts
    student_scores = {}
    for c in _concepts:
        cid = c["concept_id"]
        atts = attempts_map.get(cid, [])
        student_scores[cid] = _recommender.compute_concept_signals(cid, atts)

    graph_data = _graph.get_graph_data(student_scores)
    return ConceptGraphResponse(
        student_id=student_id,
        nodes=graph_data["nodes"],
        edges=graph_data["edges"]
    )

@router.get("/students/{student_id}/progress/{concept_id}", response_model=ProgressResponse)
def get_concept_progress(student_id: str, concept_id: str):
    """
    Returns recall-probability-over-time series for charting.
    """
    concept_meta = _graph.concept_map.get(concept_id)
    if not concept_meta:
        raise HTTPException(status_code=404, detail=f"Concept '{concept_id}' not found")

    attempts_map = fetch_student_attempts(student_id)
    atts = attempts_map.get(concept_id, [])

    decay_eval = _decay.evaluate_student_concept(atts)
    trajectory = _decay.generate_decay_trajectory(atts, forecast_days=14)
    mastery = _bkt.compute_mastery([a["correct"] for a in atts]) if atts else 0.05

    return ProgressResponse(
        student_id=student_id,
        concept_id=concept_id,
        concept_name=concept_meta["name"],
        current_recall=decay_eval["recall_probability"],
        current_mastery=round(mastery, 3),
        half_life_days=decay_eval["half_life_days"],
        elapsed_days=decay_eval["elapsed_days"],
        criticality=_graph.get_criticality(concept_id),
        trajectory=trajectory
    )

@router.post("/students/{student_id}/attempt", response_model=AttemptResponse)
def post_attempt(student_id: str, attempt: AttemptCreate):
    """
    Logs a new quiz/flashcard attempt and triggers immediate recomputation
    of mastery + decay for that concept, returning updated scores and next recommendation.
    """
    if attempt.concept_id not in _graph.concept_map:
        raise HTTPException(status_code=404, detail=f"Concept '{attempt.concept_id}' not found")

    ts = attempt.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Log attempt into SQLite
    log_attempt(
        student_id=student_id,
        concept_id=attempt.concept_id,
        correct=attempt.correct,
        response_time_seconds=attempt.response_time_seconds,
        timestamp=ts
    )

    # 2. Re-fetch student attempts to trigger instant recomputation
    attempts_map = fetch_student_attempts(student_id)
    new_signals = _recommender.compute_concept_signals(attempt.concept_id, attempts_map.get(attempt.concept_id, []))
    
    # 3. Get updated top recommendation
    new_recs = _recommender.recommend(attempts_map, top_k=1)
    top_rec = new_recs[0] if new_recs else None

    return AttemptResponse(
        success=True,
        message=f"Attempt logged. Mastery updated to {round(new_signals['mastery']*100, 1)}%, recall refreshed to {round(new_signals['recall_probability']*100, 1)}%.",
        student_id=student_id,
        concept_id=attempt.concept_id,
        new_mastery=new_signals["mastery"],
        new_recall_probability=new_signals["recall_probability"],
        new_priority=new_signals["priority"],
        top_recommendation=top_rec
    )

@router.get("/concepts")
def get_concepts():
    """Returns full catalog of concepts with practice questions."""
    return [
        {
            **c,
            "criticality": _graph.get_criticality(c["concept_id"]),
            "downstream_count": len(_graph.get_downstream_concepts(c["concept_id"])),
            "questions": get_questions_for_concept(c["concept_id"], c["name"])
        }
        for c in _concepts
    ]

@router.get("/config/weights", response_model=WeightsConfig)
def get_weights():
    return WeightsConfig(
        w1_mastery=_recommender.w1,
        w2_recall=_recommender.w2,
        w3_criticality=_recommender.w3
    )

@router.post("/config/weights", response_model=WeightsConfig)
def update_weights(cfg: WeightsConfig):
    _recommender.set_weights(cfg.w1_mastery, cfg.w2_recall, cfg.w3_criticality)
    return WeightsConfig(
        w1_mastery=_recommender.w1,
        w2_recall=_recommender.w2,
        w3_criticality=_recommender.w3
    )

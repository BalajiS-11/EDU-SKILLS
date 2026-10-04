import pytest
from app.models.bkt import BayesianKnowledgeTracing
from app.models.decay import HalfLifeDecayModel
from app.models.graph import ConceptGraph
from app.models.recommender import FusionRecommender, DEFAULT_W1, DEFAULT_W2, DEFAULT_W3

@pytest.fixture
def test_setup():
    concepts = [
        {"concept_id": "c01", "name": "Basic Arithmetic", "prerequisites": []},
        {"concept_id": "c02", "name": "Linear Equations", "prerequisites": ["c01"]},
        {"concept_id": "c03", "name": "Quadratic Equations", "prerequisites": ["c02"]}
    ]
    cg = ConceptGraph(concepts)
    recommender = FusionRecommender(cg)
    return recommender

def test_fusion_formula(test_setup):
    rec = test_setup
    signals = rec.compute_concept_signals("c01", [
        {"timestamp": "2026-09-01 10:00:00", "correct": 1},
        {"timestamp": "2026-09-02 10:00:00", "correct": 1}
    ])
    
    expected_priority = (
        rec.w1 * signals["mastery_gap"] +
        rec.w2 * signals["forgetting_risk"] +
        rec.w3 * signals["criticality"]
    )
    assert signals["priority"] == pytest.approx(expected_priority, abs=0.01)

def test_dynamic_weights_update(test_setup):
    rec = test_setup
    rec.set_weights(0.6, 0.2, 0.2)
    assert rec.w1 == pytest.approx(0.6, abs=0.01)
    assert rec.w2 == pytest.approx(0.2, abs=0.01)
    assert rec.w3 == pytest.approx(0.2, abs=0.01)

def test_recommend_top_k(test_setup):
    rec = test_setup
    student_attempts = {
        "c01": [
            {"timestamp": "2026-08-01 10:00:00", "correct": 1},  # old, decayed
        ],
        "c02": [
            {"timestamp": "2026-09-05 10:00:00", "correct": 1},  # fresh
        ]
    }
    top_recs = rec.recommend(student_attempts, top_k=2)
    assert len(top_recs) == 2
    assert "reason" in top_recs[0]
    assert "mastery" in top_recs[0]
    assert "recall_probability" in top_recs[0]
    assert "criticality" in top_recs[0]
    assert "priority" in top_recs[0]

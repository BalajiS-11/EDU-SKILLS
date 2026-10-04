import pytest
from app.models.bkt import BayesianKnowledgeTracing, LogisticRegressionBaseline

def test_bkt_unseen_concept():
    bkt = BayesianKnowledgeTracing(p_l0=0.15)
    mastery = bkt.compute_mastery([])
    assert mastery == pytest.approx(0.15, abs=0.01)

def test_bkt_consecutive_correct():
    bkt = BayesianKnowledgeTracing(p_l0=0.15, p_transit=0.18, p_guess=0.2, p_slip=0.1)
    # Successive correct responses should strictly increase mastery
    m1 = bkt.compute_mastery([1])
    m2 = bkt.compute_mastery([1, 1])
    m3 = bkt.compute_mastery([1, 1, 1])
    m5 = bkt.compute_mastery([1, 1, 1, 1, 1])

    assert m1 > 0.15
    assert m2 > m1
    assert m3 > m2
    assert m5 > 0.85
    assert m5 <= 1.0

def test_bkt_incorrect_drops():
    bkt = BayesianKnowledgeTracing(p_l0=0.5)
    m_before = bkt.compute_mastery([1, 1])
    m_after_slip = bkt.compute_mastery([1, 1, 0])
    assert m_after_slip < m_before

def test_logistic_regression_baseline():
    lr = LogisticRegressionBaseline()
    # Test fallback prediction with no data
    p0 = lr.predict_mastery([0, 0, 0, 30.0])
    assert 0.0 <= p0 <= 1.0

    # Test high accuracy features
    p_high = lr.predict_mastery([10, 9, 1, 15.0])
    p_low = lr.predict_mastery([10, 1, 0, 65.0])
    assert p_high > p_low

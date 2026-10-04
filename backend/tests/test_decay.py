import pytest
from datetime import datetime, timedelta
from app.models.decay import HalfLifeDecayModel

def test_decay_initial():
    decay = HalfLifeDecayModel(base_half_life_days=2.5)
    info = decay.evaluate_student_concept([])
    assert info["recall_probability"] == 0.50
    assert info["total_attempts"] == 0

def test_decay_over_time():
    decay = HalfLifeDecayModel(base_half_life_days=3.0)
    current_time = datetime(2026, 9, 6, 9, 0, 0)
    
    # Attempt 1 day ago
    recent_attempts = [{
        "timestamp": (current_time - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
        "correct": 1
    }]
    # Attempt 20 days ago
    old_attempts = [{
        "timestamp": (current_time - timedelta(days=20)).strftime("%Y-%m-%d %H:%M:%S"),
        "correct": 1
    }]

    recent_eval = decay.evaluate_student_concept(recent_attempts, current_time=current_time)
    old_eval = decay.evaluate_student_concept(old_attempts, current_time=current_time)

    assert recent_eval["recall_probability"] > old_eval["recall_probability"]
    assert 0.05 <= old_eval["recall_probability"] <= 1.0

def test_half_life_expansion_with_reviews():
    decay = HalfLifeDecayModel(base_half_life_days=2.5)
    # Consecutive correct reviews should expand half-life
    h1 = decay.compute_half_life(n_correct=1, n_incorrect=0, consecutive_correct=1)
    h5 = decay.compute_half_life(n_correct=5, n_incorrect=0, consecutive_correct=5)
    
    assert h5 > h1
    assert h5 >= 5.0  # Expands substantially

def test_decay_trajectory_generation():
    decay = HalfLifeDecayModel()
    current_time = datetime(2026, 9, 6, 9, 0, 0)
    attempts = [
        {"timestamp": (current_time - timedelta(days=40)).strftime("%Y-%m-%d %H:%M:%S"), "correct": 1},
        {"timestamp": (current_time - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S"), "correct": 1}
    ]
    trajectory = decay.generate_decay_trajectory(attempts, current_time=current_time, forecast_days=14)
    assert len(trajectory) > 20
    assert any(pt["is_projected"] for pt in trajectory)
    assert any(not pt["is_projected"] for pt in trajectory)

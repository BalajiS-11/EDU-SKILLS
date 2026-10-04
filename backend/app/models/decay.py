"""
Half-Life Regression and Retention Decay Model (Ebbinghaus Forgetting Curve).
Models recall probability R(delta_t) = 2^(-delta_t / h)
where h is the estimated memory half-life (in days).
"""
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

class HalfLifeDecayModel:
    """
    Half-Life Regression (HLR) memory model based on Ebbinghaus forgetting curve.
    h = h_0 * (2 ** (alpha * n_correct - beta * n_incorrect))
    R(delta_t) = 2 ** (-delta_t / h)
    """
    def __init__(
        self,
        base_half_life_days: float = 2.5,
        alpha: float = 0.65,  # Boost factor for correct retrieval
        beta: float = 0.30    # Penalty factor for retrieval failure
    ):
        self.base_half_life_days = base_half_life_days
        self.alpha = alpha
        self.beta = beta

    def compute_half_life(self, n_correct: int, n_incorrect: int, consecutive_correct: int = 0) -> float:
        """
        Computes memory half-life h (in days) given historical review counts.
        """
        exponent = self.alpha * n_correct - self.beta * n_incorrect + 0.2 * consecutive_correct
        # Bound exponent to prevent numerical overflow/underflow
        clamped_exp = max(-2.0, min(exponent, 5.0))
        half_life = self.base_half_life_days * math.pow(2.0, clamped_exp)
        return max(0.5, float(half_life))

    def compute_recall_probability(
        self,
        elapsed_days: float,
        half_life: float
    ) -> float:
        """
        Computes current recall probability R = 2^(-delta_t / h).
        Returns value in [0.01, 1.0].
        """
        if elapsed_days < 0:
            elapsed_days = 0.0
        h = max(half_life, 0.2)
        r = math.pow(2.0, -elapsed_days / h)
        return float(np.clip(r, 0.05, 0.99))

    def evaluate_student_concept(
        self,
        attempts: List[Dict[str, Any]],
        current_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Given chronological attempts for a student on a concept,
        evaluates last attempt time, half-life, elapsed time, and recall probability at current_time.
        """
        if current_time is None:
            current_time = datetime(2026, 9, 6, 9, 0, 0)

        if not attempts:
            # Unseen concept
            return {
                "recall_probability": 0.50,
                "half_life_days": self.base_half_life_days,
                "elapsed_days": 90.0,
                "last_attempt_time": None,
                "total_attempts": 0,
                "correct_attempts": 0
            }

        # Sort chronologically
        sorted_attempts = sorted(
            attempts,
            key=lambda x: datetime.strptime(x["timestamp"], "%Y-%m-%d %H:%M:%S") if isinstance(x["timestamp"], str) else x["timestamp"]
        )

        n_correct = sum(1 for a in sorted_attempts if a["correct"] == 1)
        n_incorrect = len(sorted_attempts) - n_correct

        # Calculate consecutive correct ending streak
        consecutive_correct = 0
        for a in reversed(sorted_attempts):
            if a["correct"] == 1:
                consecutive_correct += 1
            else:
                break

        last_att = sorted_attempts[-1]
        last_dt = datetime.strptime(last_att["timestamp"], "%Y-%m-%d %H:%M:%S") if isinstance(last_att["timestamp"], str) else last_att["timestamp"]
        elapsed_days = max(0.0, (current_time - last_dt).total_seconds() / 86400.0)

        half_life = self.compute_half_life(n_correct, n_incorrect, consecutive_correct)
        recall_prob = self.compute_recall_probability(elapsed_days, half_life)

        return {
            "recall_probability": round(recall_prob, 4),
            "half_life_days": round(half_life, 2),
            "elapsed_days": round(elapsed_days, 2),
            "last_attempt_time": last_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "total_attempts": len(sorted_attempts),
            "correct_attempts": n_correct,
            "consecutive_correct": consecutive_correct
        }

    def generate_decay_trajectory(
        self,
        attempts: List[Dict[str, Any]],
        current_time: Optional[datetime] = None,
        forecast_days: int = 14
    ) -> List[Dict[str, Any]]:
        """
        Generates day-by-day recall probability time series across the 90 days
        plus a forward projection of forecast_days for charting.
        """
        if current_time is None:
            current_time = datetime(2026, 9, 6, 9, 0, 0)

        start_time = current_time - timedelta(days=90)
        trajectory = []

        # Parse attempts into datetime objects
        parsed_attempts = []
        for a in attempts:
            dt = datetime.strptime(a["timestamp"], "%Y-%m-%d %H:%M:%S") if isinstance(a["timestamp"], str) else a["timestamp"]
            parsed_attempts.append({"dt": dt, "correct": a["correct"], "response_time": a.get("response_time_seconds", 30)})

        parsed_attempts.sort(key=lambda x: x["dt"])

        # Generate sample points every 1-2 days
        total_span_days = 90 + forecast_days
        points = 60
        step_days = total_span_days / points

        for i in range(points + 1):
            point_dt = start_time + timedelta(days=i * step_days)
            point_dt_str = point_dt.strftime("%Y-%m-%d")

            # Prior attempts up to this point
            prior_atts = [a for a in parsed_attempts if a["dt"] <= point_dt]

            if not prior_atts:
                # Not yet practiced
                trajectory.append({
                    "date": point_dt_str,
                    "recall_probability": 1.0 if point_dt < start_time else 0.50,
                    "is_projected": point_dt > current_time,
                    "event": "Not Started"
                })
                continue

            # Compute state up to point_dt
            n_c = sum(1 for a in prior_atts if a["correct"] == 1)
            n_inc = len(prior_atts) - n_c
            cons_c = 0
            for a in reversed(prior_atts):
                if a["correct"] == 1:
                    cons_c += 1
                else:
                    break

            h = self.compute_half_life(n_c, n_inc, cons_c)
            last_dt = prior_atts[-1]["dt"]
            elapsed = max(0.0, (point_dt - last_dt).total_seconds() / 86400.0)
            recall = self.compute_recall_probability(elapsed, h)

            # Check if an attempt occurred near this day
            recent_event = None
            for a in prior_atts:
                if abs((a["dt"] - point_dt).total_seconds()) < 86400.0 * (step_days / 2.0):
                    recent_event = "Practice (Correct)" if a["correct"] == 1 else "Practice (Review needed)"
                    break

            trajectory.append({
                "date": point_dt_str,
                "recall_probability": round(recall, 3),
                "is_projected": point_dt > current_time,
                "event": recent_event,
                "half_life_days": round(h, 1),
                "elapsed_days": round(elapsed, 1)
            })

        return trajectory

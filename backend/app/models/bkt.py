"""
Bayesian Knowledge Tracing (BKT) and Logistic Regression Baseline
for Mastery Estimation.
"""
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.linear_model import LogisticRegression

class BayesianKnowledgeTracing:
    """
    Standard Corbett & Anderson Bayesian Knowledge Tracing model.
    Tracks latent mastery probability P(L_t) updated after each binary observation.
    """
    def __init__(
        self,
        p_l0: float = 0.15,  # Prior mastery probability
        p_transit: float = 0.18,  # Transition (learning) probability
        p_guess: float = 0.20,  # Guess probability
        p_slip: float = 0.10   # Slip probability
    ):
        self.p_l0 = p_l0
        self.p_transit = p_transit
        self.p_guess = p_guess
        self.p_slip = p_slip

    def compute_mastery(self, observations: List[int]) -> float:
        """
        Given a sequence of 0/1 attempt outcomes in chronological order,
        returns the posterior mastery probability P(L_t) in [0.0, 1.0].
        If no observations, returns prior P(L_0).
        """
        if not observations:
            return self.p_l0

        p_l = self.p_l0
        for obs in observations:
            # Observation update (Bayes' rule)
            if obs == 1:
                numerator = p_l * (1.0 - self.p_slip)
                denominator = numerator + (1.0 - p_l) * self.p_guess
            else:
                numerator = p_l * self.p_slip
                denominator = numerator + (1.0 - p_l) * (1.0 - self.p_guess)

            p_l_given_obs = numerator / max(denominator, 1e-9)

            # Knowledge transit for next step
            p_l = p_l_given_obs + (1.0 - p_l_given_obs) * self.p_transit

        # Clamp between 0.0 and 1.0
        return float(np.clip(p_l, 0.01, 0.99))


class LogisticRegressionBaseline:
    """
    Supervised Logistic Regression baseline for mastery estimation.
    Features: [attempt_count, correct_count, last_result, mean_response_time]
    """
    def __init__(self):
        self.model = LogisticRegression(max_iter=200)
        self.is_fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray):
        """Fit model on feature matrix X and target y (mastered: 0/1)."""
        if len(np.unique(y)) > 1:
            self.model.fit(X, y)
            self.is_fitted = True

    def predict_mastery(self, features: List[float]) -> float:
        """Outputs probability of mastery."""
        if not self.is_fitted:
            # Fallback heuristic if not fitted
            attempt_count, correct_count, last_result, _ = features
            if attempt_count == 0:
                return 0.15
            acc = correct_count / max(attempt_count, 1)
            return float(np.clip(0.6 * acc + 0.4 * last_result, 0.05, 0.95))
        
        prob = self.model.predict_proba([features])[0][1]
        return float(prob)

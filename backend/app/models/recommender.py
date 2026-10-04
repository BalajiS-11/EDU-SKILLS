"""
Tri-Signal Fusion Recommender and Plain-Language Explainability Generator.
priority(s, c) = w1 * (1 - mastery) + w2 * (1 - recall_probability) + w3 * criticality
"""
from typing import List, Dict, Any, Optional
import numpy as np
from .bkt import BayesianKnowledgeTracing
from .decay import HalfLifeDecayModel
from .graph import ConceptGraph

DEFAULT_W1 = 0.33  # Weight for Mastery Gap: (1 - mastery)
DEFAULT_W2 = 0.33  # Weight for Forgetting Risk: (1 - recall_probability)
DEFAULT_W3 = 0.34  # Weight for Prerequisite Criticality: criticality

class FusionRecommender:
    def __init__(
        self,
        concept_graph: ConceptGraph,
        bkt_model: Optional[BayesianKnowledgeTracing] = None,
        decay_model: Optional[HalfLifeDecayModel] = None,
        w1: float = DEFAULT_W1,
        w2: float = DEFAULT_W2,
        w3: float = DEFAULT_W3
    ):
        self.graph = concept_graph
        self.bkt = bkt_model or BayesianKnowledgeTracing()
        self.decay = decay_model or HalfLifeDecayModel()
        self.w1 = w1
        self.w2 = w2
        self.w3 = w3

    def set_weights(self, w1: float, w2: float, w3: float):
        """Allows dynamic configuration of tri-signal fusion weights."""
        total = w1 + w2 + w3
        if total > 0:
            self.w1 = w1 / total
            self.w2 = w2 / total
            self.w3 = w3 / total
        else:
            self.w1, self.w2, self.w3 = DEFAULT_W1, DEFAULT_W2, DEFAULT_W3

    def compute_concept_signals(
        self,
        concept_id: str,
        attempts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Computes mastery, recall probability, criticality, and individual sub-scores for one concept.
        """
        concept_meta = self.graph.concept_map.get(concept_id, {})
        obs = [a["correct"] for a in attempts]
        
        # 1. Mastery estimation via BKT
        mastery = self.bkt.compute_mastery(obs) if obs else 0.05
        mastery_gap = 1.0 - mastery

        # 2. Forgetting & recall risk via Half-Life Decay
        decay_info = self.decay.evaluate_student_concept(attempts)
        recall_prob = decay_info["recall_probability"]
        forgetting_risk = 1.0 - recall_prob

        # 3. Prerequisite criticality via NetworkX PageRank
        criticality = self.graph.get_criticality(concept_id)

        # 4. Fused priority score
        priority = (
            self.w1 * mastery_gap +
            self.w2 * forgetting_risk +
            self.w3 * criticality
        )

        downstream = self.graph.get_downstream_concepts(concept_id)
        prereqs = self.graph.get_prerequisites(concept_id)

        # Classify status
        if not attempts:
            status = "unattempted"
        elif recall_prob < 0.55:
            status = "decaying"
        elif mastery < 0.60:
            status = "learning"
        else:
            status = "mastered"

        return {
            "concept_id": concept_id,
            "name": concept_meta.get("name", concept_id),
            "module": concept_meta.get("module", "General"),
            "difficulty": concept_meta.get("difficulty", 0.5),
            "mastery": round(mastery, 4),
            "mastery_gap": round(mastery_gap, 4),
            "recall_probability": round(recall_prob, 4),
            "forgetting_risk": round(forgetting_risk, 4),
            "criticality": round(criticality, 4),
            "priority": round(priority, 4),
            "status": status,
            "half_life_days": decay_info.get("half_life_days", 2.5),
            "elapsed_days": decay_info.get("elapsed_days", 0.0),
            "last_attempt_time": decay_info.get("last_attempt_time"),
            "total_attempts": len(attempts),
            "downstream_count": len(downstream),
            "downstream_concepts": downstream[:5],
            "prerequisites": prereqs
        }

    def generate_plain_language_reason(self, signals: Dict[str, Any]) -> str:
        """
        Produces human-readable diagnostic rationale explaining the recommendation.
        """
        name = signals["name"]
        mastery_pct = round(signals["mastery"] * 100, 1)
        recall_pct = round(signals["recall_probability"] * 100, 1)
        downstream_n = signals["downstream_count"]
        elapsed_d = round(signals.get("elapsed_days", 0.0), 1)
        downstream_names = [d["name"] for d in signals.get("downstream_concepts", [])[:3]]
        downstream_str = f" ({', '.join(downstream_names)})" if downstream_names else ""

        # Analyze dominant factor
        w_mastery_gap = self.w1 * signals["mastery_gap"]
        w_forgetting = self.w2 * signals["forgetting_risk"]
        w_crit = self.w3 * signals["criticality"]

        if signals["status"] == "unattempted":
            if downstream_n > 0:
                return (
                    f"Foundational next frontier: '{name}' unlocks {downstream_n} downstream algebra modules{downstream_str}. "
                    f"Initial mastery needed to unlock advanced topics."
                )
            return f"Curriculum progression: Ready to begin '{name}'."

        if w_forgetting >= w_mastery_gap and w_forgetting >= w_crit and recall_pct < 65:
            return (
                f"High forgetting risk: Retention has dropped to {recall_pct}% after {elapsed_d} days unreviewed. "
                f"Revising now prevents memory decay on a concept that supports {downstream_n} downstream topics{downstream_str}."
            )
        elif w_mastery_gap >= w_forgetting and signals["mastery"] < 0.65:
            return (
                f"Mastery gap detected: Current mastery is only {mastery_pct}% across prior attempts. "
                f"Targeted review will eliminate lingering misconceptions before tackling dependent concepts."
            )
        elif downstream_n >= 3:
            return (
                f"Prerequisite bottleneck: '{name}' is a high-criticality foundation unlocking {downstream_n} subsequent modules{downstream_str}. "
                f"With {recall_pct}% current recall, reinforcement is needed to protect your learning pipeline."
            )
        else:
            return (
                f"Balanced revision target: Combines {mastery_pct}% mastery and {recall_pct}% retention stability. "
                f"Optimal timing to practice and solidify long-term retention."
            )

    def recommend(
        self,
        student_attempts: Dict[str, List[Dict[str, Any]]],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Ranks all 25 concepts for a student and returns the top-k recommendations
        with full score breakdown and plain-language reasoning.
        """
        all_signals = []
        attempted_cids = {cid for cid, atts in student_attempts.items() if len(atts) > 0}

        for concept in self.graph.concepts:
            cid = concept["concept_id"]
            atts = student_attempts.get(cid, [])
            sig = self.compute_concept_signals(cid, atts)

            # Check prerequisite readiness for unattempted concepts
            prereqs = concept.get("prerequisites", [])
            if not atts and prereqs:
                # If unattempted, check if prereqs are at least partially attempted
                prereq_masteries = [
                    self.bkt.compute_mastery([a["correct"] for a in student_attempts.get(p, [])])
                    if student_attempts.get(p) else 0.05
                    for p in prereqs
                ]
                min_prereq_mastery = min(prereq_masteries) if prereq_masteries else 1.0
                # If prerequisites are completely unlearned (< 0.25), penalize priority
                if min_prereq_mastery < 0.25:
                    sig["priority"] *= 0.4

            # Generate plain-language reason
            sig["reason"] = self.generate_plain_language_reason(sig)
            sig["weights"] = {"w1_mastery": self.w1, "w2_recall": self.w2, "w3_criticality": self.w3}
            all_signals.append(sig)

        # Sort by priority descending
        ranked = sorted(all_signals, key=lambda x: x["priority"], reverse=True)

        return ranked[:top_k]

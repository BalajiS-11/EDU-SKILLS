"""
Concept Prerequisite Graph and Criticality Analysis using NetworkX.
Constructs the pedagogical dependency DAG, calculates PageRank and betweenness centrality,
and extracts downstream unlocked concepts for diagnostic explainability.
"""
from typing import List, Dict, Any, Set
import networkx as nx
import numpy as np

class ConceptGraph:
    """
    Manages the DAG of concept dependencies and computes structural criticality scores.
    """
    def __init__(self, concepts: List[Dict[str, Any]]):
        self.concepts = concepts
        self.concept_map = {c["concept_id"]: c for c in concepts}
        self.forward_dag = nx.DiGraph()  # prereq -> dependent (flow of learning)
        self.reverse_dag = nx.DiGraph()  # dependent -> prereq (flow of authority/prereq voting)
        
        self._build_graph()
        self.criticality_scores = self._compute_criticality()

    def _build_graph(self):
        for c in self.concepts:
            cid = c["concept_id"]
            self.forward_dag.add_node(cid, name=c["name"], module=c.get("module", "General"), difficulty=c.get("difficulty", 0.5))
            self.reverse_dag.add_node(cid, name=c["name"], module=c.get("module", "General"), difficulty=c.get("difficulty", 0.5))

        for c in self.concepts:
            cid = c["concept_id"]
            for p in c.get("prerequisites", []):
                if p in self.concept_map:
                    # Forward edge: prerequisite unlocks dependent
                    self.forward_dag.add_edge(p, cid)
                    # Reverse edge: dependent relies upon prerequisite
                    self.reverse_dag.add_edge(cid, p)

    def _compute_criticality(self) -> Dict[str, float]:
        """
        Computes normalized criticality score in [0.0, 1.0] using PageRank on the reverse DAG.
        In this formulation, advanced downstream concepts transfer authority back to their
        foundational prerequisites, meaning nodes that unlock large or vital subtrees have high scores.
        """
        # PageRank with standard damping factor 0.85
        pagerank = nx.pagerank(self.reverse_dag, alpha=0.85, max_iter=200)
        
        # Also incorporate betweenness centrality
        betweenness = nx.betweenness_centrality(self.forward_dag)

        # Downstream descendant count
        descendant_counts = {
            cid: len(nx.descendants(self.forward_dag, cid))
            for cid in self.forward_dag.nodes
        }

        # Composite raw score
        raw_scores = {}
        for cid in self.forward_dag.nodes:
            pr_val = pagerank.get(cid, 0.0)
            bw_val = betweenness.get(cid, 0.0)
            desc_val = descendant_counts.get(cid, 0)
            raw_scores[cid] = pr_val * 0.5 + bw_val * 0.25 + (desc_val / max(len(self.concepts), 1)) * 0.25

        # Min-max normalize to [0.15, 1.0]
        min_v = min(raw_scores.values())
        max_v = max(raw_scores.values())
        norm_scores = {}
        for cid, val in raw_scores.items():
            if max_v > min_v:
                norm = 0.15 + 0.85 * ((val - min_v) / (max_v - min_v))
            else:
                norm = 0.5
            norm_scores[cid] = round(float(norm), 4)

        return norm_scores

    def get_criticality(self, concept_id: str) -> float:
        return self.criticality_scores.get(concept_id, 0.3)

    def get_downstream_concepts(self, concept_id: str) -> List[Dict[str, Any]]:
        """Returns direct dependents and total descendants count."""
        if concept_id not in self.forward_dag:
            return []
        direct = list(self.forward_dag.successors(concept_id))
        all_desc = list(nx.descendants(self.forward_dag, concept_id))
        return [
            {
                "concept_id": cid,
                "name": self.concept_map[cid]["name"],
                "is_direct": cid in direct
            }
            for cid in all_desc
        ]

    def get_prerequisites(self, concept_id: str) -> List[Dict[str, Any]]:
        """Returns direct prerequisites for a concept."""
        if concept_id not in self.forward_dag:
            return []
        prereqs = list(self.forward_dag.predecessors(concept_id))
        return [
            {
                "concept_id": pid,
                "name": self.concept_map[pid]["name"]
            }
            for pid in prereqs
        ]

    def get_graph_data(self, student_scores: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Returns JSON-serializable nodes and edges for frontend graph visualization.
        """
        nodes = []
        for c in self.concepts:
            cid = c["concept_id"]
            scores = student_scores.get(cid, {})
            nodes.append({
                "id": cid,
                "name": c["name"],
                "module": c.get("module", "General"),
                "difficulty": c.get("difficulty", 0.5),
                "mastery": scores.get("mastery", 0.0),
                "recall_probability": scores.get("recall_probability", 0.5),
                "criticality": self.get_criticality(cid),
                "priority": scores.get("priority", 0.0),
                "status": scores.get("status", "unattempted"),
                "downstream_count": len(nx.descendants(self.forward_dag, cid))
            })

        edges = []
        for u, v in self.forward_dag.edges:
            edges.append({
                "source": u,
                "target": v
            })

        return {"nodes": nodes, "edges": edges}

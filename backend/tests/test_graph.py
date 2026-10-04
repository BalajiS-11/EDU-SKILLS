import pytest
import json
from app.models.graph import ConceptGraph

@pytest.fixture
def sample_concepts():
    return [
        {"concept_id": "c01", "name": "Basic Arithmetic", "prerequisites": []},
        {"concept_id": "c02", "name": "Linear Equations", "prerequisites": ["c01"]},
        {"concept_id": "c03", "name": "Quadratic Equations", "prerequisites": ["c02"]},
        {"concept_id": "c04", "name": "Polynomial Roots", "prerequisites": ["c03"]}
    ]

def test_graph_construction(sample_concepts):
    cg = ConceptGraph(sample_concepts)
    assert len(cg.forward_dag.nodes) == 4
    assert len(cg.forward_dag.edges) == 3

def test_criticality_order(sample_concepts):
    cg = ConceptGraph(sample_concepts)
    # Root c01 unlocks c02, c03, c04, so it should have higher criticality than sink c04
    crit_c01 = cg.get_criticality("c01")
    crit_c04 = cg.get_criticality("c04")
    assert crit_c01 > crit_c04

def test_downstream_and_prereqs(sample_concepts):
    cg = ConceptGraph(sample_concepts)
    downstream = cg.get_downstream_concepts("c01")
    assert len(downstream) == 3
    
    prereqs = cg.get_prerequisites("c03")
    assert len(prereqs) == 1
    assert prereqs[0]["concept_id"] == "c02"

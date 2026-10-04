import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_list_students():
    response = client.get("/students")
    assert response.status_code == 200
    students = response.json()
    assert len(students) == 20
    assert students[0]["student_id"] == "student_01"
    assert "total_attempts" in students[0]
    assert "overall_mastery" in students[0]

def test_get_recommendation():
    response = client.get("/students/student_01/recommendation")
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "student_01"
    assert len(data["recommendations"]) == 3
    rec = data["recommendations"][0]
    assert "mastery" in rec
    assert "recall_probability" in rec
    assert "criticality" in rec
    assert "priority" in rec
    assert "reason" in rec
    assert len(rec["reason"]) > 10

def test_concept_graph():
    response = client.get("/students/student_01/concept-graph")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) == 25
    assert len(data["edges"]) > 0
    node = data["nodes"][0]
    assert "mastery" in node
    assert "recall_probability" in node
    assert "criticality" in node

def test_concept_progress():
    response = client.get("/students/student_01/progress/c03")
    assert response.status_code == 200
    data = response.json()
    assert data["concept_id"] == "c03"
    assert "current_recall" in data
    assert "trajectory" in data
    assert len(data["trajectory"]) > 10

def test_post_attempt_feedback_loop():
    # Fetch recommendation before attempt
    rec_before = client.get("/students/student_01/recommendation").json()
    top_c_before = rec_before["recommendations"][0]["concept_id"]

    # Log a correct attempt for top_c_before
    attempt_payload = {
        "concept_id": top_c_before,
        "correct": 1,
        "response_time_seconds": 22.5
    }
    response = client.post("/students/student_01/attempt", json=attempt_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["concept_id"] == top_c_before
    assert data["new_recall_probability"] > 0.0

def test_weights_config():
    get_res = client.get("/config/weights")
    assert get_res.status_code == 200

    update_res = client.post("/config/weights", json={
        "w1_mastery": 0.5,
        "w2_recall": 0.3,
        "w3_criticality": 0.2
    })
    assert update_res.status_code == 200
    weights = update_res.json()
    assert weights["w1_mastery"] == pytest.approx(0.5, abs=0.01)

import json
import random
import math
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

CONCEPTS = [
    {"concept_id": "c01", "name": "Real Numbers & Number Systems", "module": "Foundations", "difficulty": 0.2, "prerequisites": []},
    {"concept_id": "c02", "name": "Algebraic Expressions & Terms", "module": "Foundations", "difficulty": 0.25, "prerequisites": ["c01"]},
    {"concept_id": "c03", "name": "Linear Equations in One Variable", "module": "Linear Relations", "difficulty": 0.3, "prerequisites": ["c01"]},
    {"concept_id": "c04", "name": "Exponents & Radicals", "module": "Foundations", "difficulty": 0.35, "prerequisites": ["c01"]},
    {"concept_id": "c05", "name": "Linear Inequalities in One Variable", "module": "Linear Relations", "difficulty": 0.4, "prerequisites": ["c03"]},
    {"concept_id": "c06", "name": "Coordinate Plane & Cartesian Geometry", "module": "Geometry & Graphs", "difficulty": 0.3, "prerequisites": ["c01"]},
    {"concept_id": "c07", "name": "Slope & Rates of Change", "module": "Linear Relations", "difficulty": 0.45, "prerequisites": ["c03", "c06"]},
    {"concept_id": "c08", "name": "Linear Equations in Two Variables", "module": "Linear Relations", "difficulty": 0.5, "prerequisites": ["c03", "c07"]},
    {"concept_id": "c09", "name": "Graphing Linear Equations", "module": "Geometry & Graphs", "difficulty": 0.45, "prerequisites": ["c06", "c08"]},
    {"concept_id": "c10", "name": "Systems of Linear Equations", "module": "Linear Relations", "difficulty": 0.6, "prerequisites": ["c08", "c09"]},
    {"concept_id": "c11", "name": "Polynomial Arithmetic", "module": "Polynomials", "difficulty": 0.4, "prerequisites": ["c02", "c04"]},
    {"concept_id": "c12", "name": "Factoring by Common Monomials", "module": "Polynomials", "difficulty": 0.45, "prerequisites": ["c02"]},
    {"concept_id": "c13", "name": "Factoring Trinomials & Special Products", "module": "Polynomials", "difficulty": 0.6, "prerequisites": ["c11", "c12"]},
    {"concept_id": "c14", "name": "Introduction to Quadratic Equations", "module": "Quadratic Systems", "difficulty": 0.55, "prerequisites": ["c08", "c13"]},
    {"concept_id": "c15", "name": "Solving Quadratics by Factoring", "module": "Quadratic Systems", "difficulty": 0.65, "prerequisites": ["c13", "c14"]},
    {"concept_id": "c16", "name": "Completing the Square Method", "module": "Quadratic Systems", "difficulty": 0.75, "prerequisites": ["c14"]},
    {"concept_id": "c17", "name": "The Quadratic Formula & Derivation", "module": "Quadratic Systems", "difficulty": 0.7, "prerequisites": ["c16"]},
    {"concept_id": "c18", "name": "Discriminant & Nature of Roots", "module": "Quadratic Systems", "difficulty": 0.65, "prerequisites": ["c17"]},
    {"concept_id": "c19", "name": "Parabola Vertex & Axis of Symmetry", "module": "Geometry & Graphs", "difficulty": 0.7, "prerequisites": ["c09", "c16"]},
    {"concept_id": "c20", "name": "Simplifying Rational Expressions", "module": "Polynomials", "difficulty": 0.7, "prerequisites": ["c13"]},
    {"concept_id": "c21", "name": "Arithmetic Progressions: Intro & Pattern", "module": "Sequences & Series", "difficulty": 0.35, "prerequisites": ["c03"]},
    {"concept_id": "c22", "name": "General n-th Term of an AP", "module": "Sequences & Series", "difficulty": 0.5, "prerequisites": ["c21"]},
    {"concept_id": "c23", "name": "Sum of First n Terms of an AP", "module": "Sequences & Series", "difficulty": 0.6, "prerequisites": ["c22"]},
    {"concept_id": "c24", "name": "Systems of Linear Inequalities", "module": "Linear Relations", "difficulty": 0.65, "prerequisites": ["c05", "c10"]},
    {"concept_id": "c25", "name": "Applied Real-World Algebraic Modeling", "module": "Applications", "difficulty": 0.8, "prerequisites": ["c10", "c15", "c23"]}
]

STUDENTS = [
    {"student_id": f"student_{i:02d}", "name": name, "ability": ability, "review_frequency": freq}
    for i, (name, ability, freq) in enumerate([
        ("Elena Rostova", 0.85, 0.7),
        ("Marcus Vance", 0.72, 0.5),
        ("Priya Sharma", 0.90, 0.8),
        ("David Kim", 0.60, 0.4),
        ("Amara Okafor", 0.78, 0.6),
        ("Lucas Silva", 0.55, 0.3),
        ("Chloe Bennet", 0.68, 0.5),
        ("Aarav Patel", 0.82, 0.7),
        ("Sophia Ramirez", 0.75, 0.6),
        ("Julian Thorne", 0.48, 0.35),
        ("Zoe Washington", 0.88, 0.75),
        ("Liam O'Connor", 0.64, 0.45),
        ("Mei Lin", 0.92, 0.85),
        ("Tariq Al-Mansoor", 0.70, 0.55),
        ("Isabella Costa", 0.80, 0.65),
        ("Noah Tanaka", 0.58, 0.4),
        ("Hannah Schmidt", 0.74, 0.6),
        ("Ethan Walker", 0.62, 0.45),
        ("Fatima Zahra", 0.86, 0.75),
        ("Gabriel Morales", 0.52, 0.3)
    ], start=1)
]

def generate_data(output_dir="."):
    # 1. Save concepts.json
    concepts_path = f"{output_dir}/concepts.json"
    with open(concepts_path, "w", encoding="utf-8") as f:
        json.dump(CONCEPTS, f, indent=2)
    print(f"Saved {len(CONCEPTS)} concepts to {concepts_path}")

    # 2. Simulate 90 days of attempts
    sim_end = datetime(2026, 9, 6, 9, 0, 0)
    sim_start = sim_end - timedelta(days=90)

    attempts = []
    prereq_map = {c["concept_id"]: c["prerequisites"] for c in CONCEPTS}
    diff_map = {c["concept_id"]: c["difficulty"] for c in CONCEPTS}

    for student in STUDENTS:
        s_id = student["student_id"]
        ability = student["ability"]
        freq = student["review_frequency"]

        last_practice_time = {}
        correct_count = {c["concept_id"]: 0 for c in CONCEPTS}
        total_count = {c["concept_id"]: 0 for c in CONCEPTS}

        for day in range(90):
            current_day_time = sim_start + timedelta(days=day, hours=random.randint(9, 21), minutes=random.randint(0, 59))
            
            if random.random() > freq:
                continue

            candidates = []
            for c in CONCEPTS:
                cid = c["concept_id"]
                cid_idx = int(cid[1:])
                intro_day = (cid_idx - 1) * 2.8
                if day < intro_day:
                    continue
                
                prereqs = prereq_map[cid]
                if all(total_count[p] > 0 for p in prereqs):
                    candidates.append(c)

            if not candidates:
                candidates = [CONCEPTS[0], CONCEPTS[1], CONCEPTS[2]]

            num_concepts = random.choices([1, 2, 3, 4], weights=[0.2, 0.4, 0.3, 0.1])[0]
            chosen_concepts = random.sample(candidates, min(num_concepts, len(candidates)))

            for concept in chosen_concepts:
                cid = concept["concept_id"]
                diff = diff_map[cid]

                last_time = last_practice_time.get(cid)
                if last_time is None:
                    decay_factor = 0.85
                    elapsed_days = 0
                else:
                    elapsed_days = (current_day_time - last_time).total_seconds() / 86400.0
                    half_life = 2.5 * math.pow(2.0, min(correct_count[cid], 5))
                    decay_factor = math.pow(2.0, -elapsed_days / max(half_life, 0.5))

                log_odds = 2.5 * (ability - diff) + (0.5 if correct_count[cid] >= 2 else -0.2)
                p_base = 1.0 / (1.0 + math.exp(-log_odds))
                p_correct = max(0.08, min(0.96, p_base * (0.35 + 0.65 * decay_factor)))

                session_attempts = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
                for att_idx in range(session_attempts):
                    attempt_time = current_day_time + timedelta(minutes=att_idx * 3 + random.randint(1, 2))
                    is_correct = 1 if random.random() < p_correct else 0
                    
                    base_time = 25.0 + diff * 40.0
                    if is_correct:
                        resp_time = max(8.0, random.gauss(base_time, 10.0))
                    else:
                        resp_time = max(5.0, random.gauss(base_time * 1.3, 18.0))

                    attempts.append({
                        "student_id": s_id,
                        "concept_id": cid,
                        "timestamp": attempt_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "correct": is_correct,
                        "response_time_seconds": round(resp_time, 1)
                    })

                    total_count[cid] += 1
                    if is_correct:
                        correct_count[cid] += 1

                last_practice_time[cid] = current_day_time

    df = pd.DataFrame(attempts)
    df.sort_values(by="timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)

    csv_path = f"{output_dir}/attempts.csv"
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} attempts across {len(STUDENTS)} students over 90 days.")
    print(f"Saved attempts to {csv_path}")

    print("\nAttempt Statistics:")
    print(f"Total attempts: {len(df)}")
    print(f"Overall Accuracy: {df['correct'].mean():.2%}")
    print(f"Average Response Time: {df['response_time_seconds'].mean():.1f}s")
    print(f"Unique concepts practiced: {df['concept_id'].nunique()}")

if __name__ == "__main__":
    generate_data("backend/data")

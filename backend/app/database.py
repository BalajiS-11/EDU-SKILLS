"""
SQLite Database initialization, models, and seeding for RootCause.
"""
import os
import sqlite3
import json
import pandas as pd
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rootcause.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(data_dir: Optional[str] = None):
    """
    Initializes SQLite tables and seeds with concepts and attempts if empty.
    """
    if data_dir is None:
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        student_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ability REAL DEFAULT 0.7,
        review_frequency REAL DEFAULT 0.5
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS concepts (
        concept_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        module TEXT NOT NULL,
        difficulty REAL NOT NULL,
        prerequisites TEXT NOT NULL -- JSON array of concept_ids
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        concept_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        correct INTEGER NOT NULL,
        response_time_seconds REAL NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (concept_id) REFERENCES concepts(concept_id)
    )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_student_concept ON attempts(student_id, concept_id)")

    conn.commit()

    # Check if concepts need seeding
    cursor.execute("SELECT COUNT(*) FROM concepts")
    if cursor.fetchone()[0] == 0:
        concepts_file = os.path.join(data_dir, "concepts.json")
        if os.path.exists(concepts_file):
            with open(concepts_file, "r", encoding="utf-8") as f:
                concepts_data = json.load(f)
            for c in concepts_data:
                cursor.execute(
                    "INSERT INTO concepts (concept_id, name, module, difficulty, prerequisites) VALUES (?, ?, ?, ?, ?)",
                    (c["concept_id"], c["name"], c.get("module", "General"), c.get("difficulty", 0.5), json.dumps(c.get("prerequisites", [])))
                )
            print(f"Seeded {len(concepts_data)} concepts into SQLite.")

    # Check if students need seeding
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        students_seed = [
            ("student_01", "Elena Rostova", 0.85, 0.7),
            ("student_02", "Marcus Vance", 0.72, 0.5),
            ("student_03", "Priya Sharma", 0.90, 0.8),
            ("student_04", "David Kim", 0.60, 0.4),
            ("student_05", "Amara Okafor", 0.78, 0.6),
            ("student_06", "Lucas Silva", 0.55, 0.3),
            ("student_07", "Chloe Bennet", 0.68, 0.5),
            ("student_08", "Aarav Patel", 0.82, 0.7),
            ("student_09", "Sophia Ramirez", 0.75, 0.6),
            ("student_10", "Julian Thorne", 0.48, 0.35),
            ("student_11", "Zoe Washington", 0.88, 0.75),
            ("student_12", "Liam O'Connor", 0.64, 0.45),
            ("student_13", "Mei Lin", 0.92, 0.85),
            ("student_14", "Tariq Al-Mansoor", 0.70, 0.55),
            ("student_15", "Isabella Costa", 0.80, 0.65),
            ("student_16", "Noah Tanaka", 0.58, 0.4),
            ("student_17", "Hannah Schmidt", 0.74, 0.6),
            ("student_18", "Ethan Walker", 0.62, 0.45),
            ("student_19", "Fatima Zahra", 0.86, 0.75),
            ("student_20", "Gabriel Morales", 0.52, 0.3)
        ]
        cursor.executemany("INSERT INTO students (student_id, name, ability, review_frequency) VALUES (?, ?, ?, ?)", students_seed)
        print(f"Seeded {len(students_seed)} students into SQLite.")

    # Check if attempts need seeding
    cursor.execute("SELECT COUNT(*) FROM attempts")
    if cursor.fetchone()[0] == 0:
        attempts_file = os.path.join(data_dir, "attempts.csv")
        if os.path.exists(attempts_file):
            df = pd.read_csv(attempts_file)
            rows = [
                (r["student_id"], r["concept_id"], str(r["timestamp"]), int(r["correct"]), float(r["response_time_seconds"]))
                for _, r in df.iterrows()
            ]
            cursor.executemany(
                "INSERT INTO attempts (student_id, concept_id, timestamp, correct, response_time_seconds) VALUES (?, ?, ?, ?, ?)",
                rows
            )
            print(f"Seeded {len(rows)} attempts into SQLite.")

    conn.commit()
    conn.close()

def fetch_all_concepts() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT concept_id, name, module, difficulty, prerequisites FROM concepts ORDER BY concept_id")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "concept_id": r["concept_id"],
            "name": r["name"],
            "module": r["module"],
            "difficulty": r["difficulty"],
            "prerequisites": json.loads(r["prerequisites"])
        }
        for r in rows
    ]

def fetch_student_attempts(student_id: str) -> Dict[str, List[Dict[str, Any]]]:
    """Returns mapping: concept_id -> list of chronological attempt dicts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT concept_id, timestamp, correct, response_time_seconds FROM attempts WHERE student_id = ? ORDER BY timestamp ASC",
        (student_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    result: Dict[str, List[Dict[str, Any]]] = {}
    for r in rows:
        cid = r["concept_id"]
        if cid not in result:
            result[cid] = []
        result[cid].append({
            "timestamp": r["timestamp"],
            "correct": r["correct"],
            "response_time_seconds": r["response_time_seconds"]
        })
    return result

def log_attempt(student_id: str, concept_id: str, correct: int, response_time_seconds: float, timestamp: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO attempts (student_id, concept_id, timestamp, correct, response_time_seconds) VALUES (?, ?, ?, ?, ?)",
        (student_id, concept_id, timestamp, correct, response_time_seconds)
    )
    conn.commit()
    conn.close()

# Auto-initialize database schema and seeds on module load
init_db()

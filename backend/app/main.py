"""
EDU SKILL FastAPI Application.
"""
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.api.routes import router

# Initialize SQLite database and seed initial data
init_db()

app = FastAPI(
    title="EDU SKILL API",
    description="Smart Learning Recommender fusing Mastery, Memory Retention, and Curriculum Prerequisites.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

API_INFO = {
    "app": "EDU SKILL API",
    "status": "online",
    "documentation": "/docs",
    "endpoints": [
        "/students",
        "/students/{id}/recommendation",
        "/students/{id}/concept-graph",
        "/students/{id}/progress/{concept_id}",
        "/students/{id}/attempt",
        "/concepts",
        "/config/weights"
    ]
}

@app.get("/api")
def api_info():
    return API_INFO

# Support serving built frontend in unified deployment
FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
)
assets_path = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    # If accessed by a web browser, serve the interactive web app
    if "text/html" in accept and os.path.exists(index_file):
        return FileResponse(index_file)
    # Otherwise return API status JSON
    return API_INFO

# EDU SKILL — Deployment Guide

This guide covers all options for deploying **EDU SKILL** (FastAPI backend + React Vite frontend) to production.

---

## Architecture Overview

- **Backend**: FastAPI (Python 3.11+), SQLite (ootcause.db), BKT + Half-Life Decay recommender engine.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite.
- **Unified Capability**: FastAPI can serve the built React frontend static files directly from rontend/dist on the same port, or both can be hosted independently.

---

## Quick Deployment Options

| Deployment Target | Best For | Complexity | Cost |
| :--- | :--- | :--- | :--- |
| **Option 1: Docker (Unified)** | Any Cloud (AWS, GCP, Railway, Fly.io, DigitalOcean) | ⭐ Easy (1 Command) | Free / Low |
| **Option 2: Render.com** | Easiest cloud deployment directly from GitHub | ⭐ Very Easy | Free tier available |
| **Option 3: Vercel + Render** | Split deployment (Fast CDN + Dedicated API) | ⭐⭐ Moderate | Free |
| **Option 4: Linux VPS (Ubuntu)** | Dedicated server (EC2, Hetzner, DigitalOcean) | ⭐⭐⭐ Advanced | \ - \/mo |

---

## Option 1: Docker (Recommended — 1 Single Command)

A multi-stage Dockerfile is included in the project root. It builds the React frontend with Node.js and bundles it with the FastAPI backend into a single container.

### Run with Docker Compose:
`ash
docker compose up --build -d
`

### Or build and run directly with Docker:
`ash
# 1. Build image
docker build -t eduskill .

# 2. Run container
docker run -d -p 8000:8000 --name eduskill-app eduskill
`

Visit:
- **Web App**: http://localhost:8000
- **Swagger API Docs**: http://localhost:8000/docs

---

## Option 2: Render.com (Easiest Cloud Deployment)

You can deploy the entire app to [Render](https://render.com) for free:

### A. Deploy Backend as Web Service
1. Push this project to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
3. Select your repository.
4. Fill in the settings:
   - **Name**: eduskill-api
   - **Root Directory**: ackend
   - **Environment**: Python 3
   - **Build Command**: pip install -r requirements.txt
   - **Start Command**: uvicorn app.main:app --host 0.0.0.0 --port 
5. Click **Create Web Service**.
6. Copy your public backend URL (e.g. https://eduskill-api.onrender.com).

### B. Deploy Frontend as Static Site
1. In Render Dashboard -> **New** -> **Static Site**.
2. Select the same repository.
3. Fill in:
   - **Root Directory**: rontend
   - **Build Command**: 
pm install && npm run build
   - **Publish Directory**: dist
4. Under **Environment Variables**, add:
   - VITE_API_BASE_URL = https://eduskill-api.onrender.com (your backend URL from Step A)
5. Click **Create Static Site**.

---

## Option 3: Vercel (Frontend) + Render (Backend)

For blazing fast global CDN performance:

1. **Deploy Backend**: Follow Option 2A on Render to get your backend API URL.
2. **Deploy Frontend on Vercel**:
   - Install Vercel CLI or import repository on [Vercel.com](https://vercel.com).
   - Set **Root Directory** to rontend.
   - In **Environment Variables**, add:
     - Key: VITE_API_BASE_URL
     - Value: https://your-backend-api.onrender.com
   - Click **Deploy**.

---

## Option 4: Linux VPS (Ubuntu / Debian + Nginx + Systemd)

If you are hosting on an EC2 instance, DigitalOcean Droplet, or Linode:

### 1. Install System Dependencies
`ash
sudo apt update && sudo apt install -y python3-pip python3-venv nodejs npm nginx git
`

### 2. Clone and Setup
`ash
git clone <your-repo-url> /var/www/eduskill
cd /var/www/eduskill

# Build Frontend
cd frontend
npm install
npm run build

# Setup Backend Virtualenv
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
`

### 3. Create Systemd Service for FastAPI
Create /etc/systemd/system/eduskill.service:
`ini
[Unit]
Description=EDU SKILL FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/eduskill/backend
ExecStart=/var/www/eduskill/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
`
Start the service:
`ash
sudo systemctl daemon-reload
sudo systemctl enable eduskill
sudo systemctl start eduskill
`

### 4. Configure Nginx Reverse Proxy
Edit /etc/nginx/sites-available/eduskill:
`
ginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve built React frontend
    location / {
        root /var/www/eduskill/frontend/dist;
        try_files  / /index.html;
    }

    # Proxy API requests to FastAPI
    location /students {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP ;
    }

    location /concepts {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
    }

    location /config {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
    }
}
`
Enable site and restart Nginx:
`ash
sudo ln -s /etc/nginx/sites-available/eduskill /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
`

---

## Option 5: Local Production Mode

To run in production mode on your current machine:

1. **Build Frontend**:
   `ash
   cd frontend
   npm run build
   `

2. **Start Backend with Production Settings**:
   `ash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   `

Open http://localhost:8000 in any web browser.

---

## Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| PORT | 8000 | Port for the Uvicorn server |
| VITE_API_BASE_URL | "" (relative) / http://localhost:8000 in dev | URL of the backend API for separate frontend hosting |

---

## Health Check & Verification

Once deployed, verify:
- GET / -> Serves the web UI (for browsers) or status JSON (for curl/API)
- GET /docs -> Interactive Swagger API documentation
- GET /students -> Returns student list

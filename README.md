# AI CRM for Healthcare Professionals

## Overview

An AI-powered CRM system built for Healthcare Professionals (HCPs) that helps medical representatives log doctor interactions, generate AI-powered summaries, and manage HCP information.

## Features

- AI-powered interaction summarization
- HCP Directory
- Dashboard with CRM statistics
- Log Interaction module
- AI Chat Assistant
- FastAPI backend
- LangGraph workflow
- Groq LLM integration

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router

### Backend
- FastAPI
- LangGraph
- LangChain
- Groq API
- Python

## Project Structure

```
AI-CRM-HCP
│
├── frontend
├── backend
└── README.md
```

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend

python -m venv venv

# Activate venv (Windows)
venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn app.main:app --reload
```

Create `backend/.env` with `GROQ_API_KEY` and `DATABASE_URL` (optional: `MODEL_NAME`, `ALLOWED_ORIGINS`).
All routes are served under `/api`. In dev, Vite proxies `/api` to `http://localhost:8000`.

Check configuration at `/api/health` — it returns `{status, db, llm}` and HTTP 503 if anything is misconfigured.

## API Documentation

Open:

```
http://localhost:8000/api/docs
```

## Future Improvements

- Authentication
- Database Integration
- Notifications
- Analytics Dashboard
- Voice Notes
- AI-powered Follow-up Recommendations
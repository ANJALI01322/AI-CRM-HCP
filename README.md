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

## API Documentation

Open:

```
http://127.0.0.1:8000/docs
```

## Future Improvements

- Authentication
- Database Integration
- Notifications
- Analytics Dashboard
- Voice Notes
- AI-powered Follow-up Recommendations
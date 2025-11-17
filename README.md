# DataInsight – Full-Stack Kanban Board (Django + React + TypeScript)

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-5.1-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

A beautiful, production-ready Kanban board (Trello/Notion style) built with modern technologies.

**Tech Stack**  
- **Backend**: Django 5 + Django REST Framework  
- **Frontend**: React 18 + TypeScript + Vite + styled-components + dnd-kit + Framer Motion  
- **Database**: PostgreSQL (production) / SQLite (dev)  
- **Deployment**: Docker + Docker Compose

### Features
- Drag & drop tasks between columns.
- Inline editing (double-click or pencil icon).
- Fully responsive (mobile = one column per screen with swipe).
- Glassmorphism dark UI (2025 aesthetic).
- Complete validation (unique stage names, cannot delete non-empty stages, etc).
- Beautiful toasts with react-hot-toast.
- 100% TypeScript.
- 5 passing Django integration tests.
- Zero-config setup with Docker.

### How to run the web app:

- Clone the repository:
```bash
git clone https://github.com/your-username/datainsight-demo.git
```
```bash
cd datainsight-demo
```
- Start everything (backend + frontend + DB)
```bash
docker compose up --build
```

That’s it!

Now open the frontend: http://localhost:5173

### How to run the tests:

Inside of the ```/backend/tests``` folder, run:
```bash
python manage.py test tasks
```

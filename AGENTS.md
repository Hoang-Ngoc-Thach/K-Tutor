# K-Tutor — Agent Instructions

## Project overview

Korean learning web app for Vietnamese learners. Monorepo with three parts:

- `frontend/` — Vite + React JSX (no TypeScript) + Tailwind CSS v4
- `backend/` — NestJS 10 + TypeORM + MySQL (database `k_tutor`)
- `ai-service/` — Planned OCR / TTS (only a README today)

The frontend talks only to the backend; the backend calls `ai-service` and Gemini.
Roles: `learner`, `admin`. The first admin is created by SQL (no UI for it).

## How to work with the user

- Reply in **Vietnamese**. The user is a student and junior developer on **Windows + PowerShell**.
- Guide one step at a time with complete code blocks (no "..." or omitted parts).
- Give honest feedback if a direction has a problem; do not just agree.
- Code identifiers, comments and API messages are English. UI text is Vietnamese.

## Product direction

### 1. Basic Korean learning

- Content tree: Level → Topic → Vocabulary + Grammar (about 5 grammar items per topic).
- Everything is created by the admin. Each vocabulary and grammar item has example sentences (Korean + Vietnamese).
- Learners study vocabulary as flashcards and read grammar as HTML text pages.
- Practice modes (Quizlet style): type Korean word, match columns, multiple choice, sentence ordering.
- Pronunciation: browser Web Speech API (`speechSynthesis`, `ko-KR`) via a `useSpeak` hook.

### 2. TOPIK practice (Study4 style)

- Exam → Section (Listening, Reading, Writing) → Question (text or image, 4 options, correct answer, explanation).
- Listening has one audio file per exam, uploaded once. Questions have optional image, category, and audio time ranges.
- Learner flow: pick exam, countdown timer, submit, score, review.
- Admin: full-page editor with audio upload, question images, categories and listening ranges.

### 3. Dictionary lookup

Any-word lookup through an external dictionary API (likely KRDict), called from the backend with caching.

## Setup & Build

```powershell
# Backend
cd backend
npm install
npm run build
npm test
npm run start:dev

# Frontend
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

## Rules

- Change only what the task requires. Do not rename, reformat or "clean up" existing code.
- No new npm packages without asking.
- New database columns must be nullable so existing data keeps working.
- Never modify `backend/.env`. Keep `.env.example` in sync.
- Never commit secrets.
- At the end, list every existing file you modified.
- When the user confirms work is tested, update the roadmap status in `.agents/skills/kt-project-context/SKILL.md`.

## Detailed conventions

- Backend: see `backend/AGENTS.md` or `.agents/skills/kt-nestjs-module/SKILL.md`
- Frontend: see `frontend/AGENTS.md` or `.agents/skills/kt-frontend-page/SKILL.md`
- Domain model and roadmap: see `.agents/skills/kt-project-context/SKILL.md`

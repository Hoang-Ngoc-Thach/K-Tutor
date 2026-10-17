---
name: kt-project-context
description: Product vision, domain model, decisions and roadmap of K-Tutor (Korean learning web app for Vietnamese learners). Use at the start of ANY K-Tutor task, and whenever the user talks about levels, topics, vocabulary, grammar, flashcards, practice games, TOPIK exams, dictionary lookup, pronunciation or OCR, even if they don't name the project.
---

# K-Tutor project context

## How to work with the user

- Reply in **Vietnamese**. The user is a student and junior developer on **Windows + PowerShell**.
- Guide **one step at a time**, each step with **complete code blocks** (no "..." or omitted parts), then wait for the user to confirm before the next step.
- Give honest feedback if a direction has a problem; do not just agree.
- Code identifiers, comments and API messages are English. UI text is Vietnamese.

## Architecture

Three parts, one repo: `frontend/` (Vite + React JSX + Tailwind), `backend/` (NestJS + TypeORM + MySQL, db `k_tutor`), `ai-service/` (planned OCR / TTS, only a README today). The frontend talks only to the backend; the backend calls `ai-service` and Gemini. Roles: `learner`, `admin`. The first admin is created by SQL (no UI for it).

## Product direction (decided)

### 1. Basic Korean learning

- Content tree: **Level** (Sơ cấp 1, Sơ cấp 2, Trung cấp 1...) → **Topic** (Chào hỏi, Văn phòng, Sức khỏe...) → **Vocabulary** + **Grammar** (about 5 grammar items per topic).
- **Everything is created by the admin** in the admin area. We build our own data; no external vocabulary API for this.
- Each vocabulary and each grammar item has **example sentences** (Korean + Vietnamese meaning).
- Learners study vocabulary as **flashcards** and read grammar as an **HTML text page**.
- Practice modes (Quizlet style) are all generated from the same vocabulary and example sentences, with no extra data:
  type the Korean word, match Korean ↔ Vietnamese columns, multiple choice (3 wrong answers taken from other words of the same topic), and sentence ordering (split an example sentence into words and shuffle). Modes can be mixed in one test.
- **Pronunciation:** browser **Web Speech API** (`speechSynthesis`, `ko-KR`) via a `useSpeak` hook. Admins do NOT upload mp3 per word. Upgrade later only if voice quality is a problem.

### 2. TOPIK practice (Study4 style)

- Exam → Section (Listening, Reading, Writing) → Question (text or image, 4 options, correct answer, explanation). Listening has **one audio file per exam**, uploaded once.
- Learner flow: pick exam, countdown timer, submit, score, review each question with answer and explanation.
- Entering exams: an admin tool with the PDF page on the left and the question form on the right. The admin drags a box over one question; that region goes to OCR (`ai-service`) or pdf.js (if the PDF has a real text layer), and the result fills the form so the admin can compare with the original and fix it. Question blocks with pictures, tables or charts are saved as an **image**, not OCR'd.
- Build order: exam data model → manual question form → region-selection OCR tool.

### 3. Dictionary lookup

Any-word lookup through an external dictionary API (likely KRDict; check whether it returns Vietnamese). Call it **from the backend** (never expose the key) and **cache** results in the DB.

### 4. AI features

Later. Not designed yet.

## Roadmap and status

1. Backend + admin CRUD for Level / Topic / Vocabulary / Grammar. **Entities done. `levels` and `topics` CRUD done and tested. Next: vocabularies, then grammars, example sentences.**
2. Admin pages call the real API (they still use inline mock data).
3. Learner UI: levels → topics → flashcards + grammar reading.
4. Practice modes.
5. Pronunciation hook.
6. Dictionary lookup.
7. TOPIK.
8. AI.

## Keeping the roadmap current

When the user confirms that a feature is finished and tested (for example "test xong rồi", "thành công rồi"), update the **bold status text of the matching roadmap item** in this file in the same task: move finished parts to "done and tested" and set the new "Next:" part. Change only that status text. Never mark something done before the user confirms the test passed. Mention in your final message that you updated it.

## Known mismatches

- `docs/architecture/api-contract.md` still describes the old model (`/topics?goal=`, items, progress) and has **no levels**. When adding learning-content endpoints, update that file in the same task and tell the user what changed.
- Root `README.md` lists React Native / TypeScript and no database; the real frontend is plain JSX with Vite and the database is MySQL.
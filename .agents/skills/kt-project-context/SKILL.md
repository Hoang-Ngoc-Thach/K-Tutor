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

1. Backend + admin CRUD for Level / Topic / Vocabulary / Grammar. **Level, Topic, Vocabulary and Grammar CRUD are implemented; grammar examples are supported. Next: vocabulary example sentences.**
2. Admin pages for levels, topics, content, users, statistics and TOPIK call the real API.
3. Learner UI for level/topic browsing, flashcards and grammar reading uses real API data.
4. Practice modes. **`/review` has four client-side vocabulary games using real API data. Next: add typing the Vietnamese meaning and sentence-ordering practice from examples.**
5. Pronunciation hook. **Browser Web Speech API pronunciation is implemented.**
6. Dictionary lookup. **Not implemented; next: evaluate a Vietnamese-capable dictionary source and backend caching.**
7. TOPIK. **Learner exam listing, attempts, timed multiple-choice practice (with dual listening audio modes: per-question practice and single-play exam mode, plus question images and categories), scoring and admin exam management are done and tested. Next: Study4-style result screen, writing questions (53/54), and PDF/OCR entry.**
8. AI. **Not implemented; OCR, AI text-to-speech and AI sentence feedback remain planned.**

## Keeping the roadmap current

When the user confirms that a feature is finished and tested (for example "test xong rồi", "thành công rồi"), update the **bold status text of the matching roadmap item** in this file in the same task: move finished parts to "done and tested" and set the new "Next:" part. Change only that status text. Never mark something done before the user confirms the test passed. Mention in your final message that you updated it.

## Known mismatches

- `docs/architecture/api-contract.md` marks sections 2, 4, 5 and 6 as not implemented.
- `docs/3.2-prd.md` marks goal selection, persistent learned state, progress summary, OCR, AI text-to-speech and AI sentence feedback as not implemented.
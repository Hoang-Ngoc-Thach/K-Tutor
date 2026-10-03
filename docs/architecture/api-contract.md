# API Contract

**Status:** Draft — pending team approval

Single source of truth for the frontend, backend and AI service. Derived from `3.5-feature-specification.md`. Sections marked **(Proposed)** go beyond the accepted PRD and need a PRD revision before implementation.

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | `/api/v1`. Local: `http://localhost:3000/api/v1`. All paths below are relative to it |
| Frontend config | `VITE_BACKEND_URL=http://localhost:3000/api/v1`, so the frontend `api/` layer calls paths like `/topics` |
| Auth | `Authorization: Bearer <accessToken>`. Missing or expired token → `401` (frontend redirects to Login) |
| Roles | `learner`, `admin`. Admin routes (`/admin/*`) reject learners with `403` |
| Success envelope | `{ "statusCode": 200, "message": "...", "data": ... }` |
| Error shape | NestJS default: `{ "statusCode": 400, "message": "..." \| ["..."], "error": "Bad Request" }` |
| Naming | JSON fields `camelCase`; ids are UUID strings; timestamps ISO 8601 |
| Enums | goal: `conversation` \| `topik`; role: `learner` \| `admin`; item type: `vocabulary` \| `grammar` |
| Pagination | Query `current` (1-based) and `pageSize`; response `data: { items: [...], meta: { current, pageSize, total } }` |
| AI calls | The frontend only talks to the NestJS backend. The backend calls Gemini and `ai-service` (OCR/TTS) |
| UI language | Messages shown to users are produced by the frontend in Vietnamese; API `message` strings are English |

## 2. Auth

| Method | Path | Body | Success `data` | Errors |
|---|---|---|---|---|
| POST | `/auth/register` | `{ email, password }` | `{ id, email }` (201) | 400 invalid email / short password, 409 email exists |
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, user: { id, email, role, goal } }` | 401 invalid credentials, 403 `ACCOUNT_LOCKED` |
| GET | `/auth/me` | — | `{ id, email, role, goal }` | 401 |
| PATCH | `/users/me/goal` | `{ goal }` | `{ goal }` | 400 |

`goal` is `null` until the user picks one. `goal === null` after login means: show goal selection first. Progress under a previous goal is kept when the goal changes.

## 3. Learning path

| Method | Path | Notes | Success `data` |
|---|---|---|---|
| GET | `/topics?goal=` | Topics for a goal with the caller's progress | `[{ id, name, description, totalItems, learnedItems }]` |
| GET | `/topics/:id` | One topic with its items | `{ id, name, description, items: [Item] }` |
| PUT | `/items/:id/progress` | Body `{ learned: boolean }`, idempotent | `{ itemId, learned }` |
| GET | `/progress?goal=` | Progress for one goal | `{ learned, total, topics: [{ topicId, name, learned, total }] }` |

`Item`:

```json
{
  "id": "uuid",
  "type": "vocabulary",
  "korean": "안녕하세요",
  "romanization": "annyeonghaseyo",
  "meaningVi": "Xin chào",
  "exampleKo": "안녕하세요, 만나서 반가워요.",
  "exampleVi": "Xin chào, rất vui được gặp bạn.",
  "audioUrl": null,
  "learned": false
}
```

`romanization`, `exampleKo`, `exampleVi`, `audioUrl` are optional. When `audioUrl` is `null` the frontend may fall back to browser speech synthesis (`ko-KR`).

## 4. Vocabulary review

| Method | Path | Notes | Success `data` |
|---|---|---|---|
| GET | `/topics/:id/review?format=&limit=` | `format`: `type-meaning` \| `type-korean` \| `match-pairs` | `{ format, questions: [{ itemId, prompt }] }`; for `match-pairs`: `{ format, pairs: { korean: [{ itemId, text }], meaning: [{ itemId, text }] } }` (meaning column shuffled) |
| POST | `/topics/:id/review/submit` | Body `{ format, answers: [{ itemId, answer }] }`; answers are compared after trimming and case-folding | `{ correct, total, revisit: [{ itemId, korean, meaningVi }] }` |

A review session does not change learned/not-learned state in v1.

## 5. Scan to speech

| Method | Path | Body | Success `data` | Errors |
|---|---|---|---|---|
| POST | `/scan/ocr` | `multipart/form-data`, field `image` (jpg, png, webp, max 5 MB) | `{ text }` | 400 unsupported format or too large, 422 no readable text, 502 OCR service failure |
| POST | `/scan/tts` | `{ text }` (max 500 characters) | `{ audioBase64, mimeType }` | 400 empty or too long, 502 TTS service failure |

The frontend plays the audio from a data URL built from `audioBase64`. Nothing is stored.

## 6. Sentence practice

| Method | Path | Body | Success `data` | Errors |
|---|---|---|---|---|
| POST | `/practice/sentence` | `{ sentence }` | `{ isCorrect, explanationVi, correctedSentence, suggestion }` | 400 empty, 429 rate limited, 502 AI failure |

Single-turn: each request is evaluated alone. `correctedSentence` is `null` when `isCorrect` is true; `suggestion` is optional.

## 7. TOPIK practice (Proposed)

| Method | Path | Notes | Success `data` |
|---|---|---|---|
| GET | `/topik/exams` | List imported exams | `[{ id, name, level, hasListening, hasReading }]` |
| GET | `/topik/exams/:id/questions?section=` | `section`: `reading` \| `listening`. Correct answers are not included | `[{ id, number, section, prompt, audioUrl, choices: [string], grammarTags: [string] }]` |
| POST | `/topik/exams/:id/submit` | Body `{ answers: [{ questionId, choice }] }` | `{ score, correct, total, results: [{ questionId, correct, correctChoice, explanationVi, grammarTags }] }` |

Exams are imported from seed JSON by an admin or a seed script, not scraped at runtime.

## 8. AI chat with feedback (Proposed)

| Method | Path | Body | Success `data` |
|---|---|---|---|
| POST | `/chat/messages` | `{ conversationId?, message }` | `{ conversationId, reply, feedback: { corrections: [{ original, corrected, explanationVi }], vocabularyNotes: [string] } }` |
| GET | `/chat/conversations/:id` | — | `{ id, messages: [{ role, content, createdAt }] }` |

Contradicts the PRD non-goal "open chatbot": needs a PRD revision first.

## 9. Admin (role `admin`)

| Method | Path | Body / query | Success `data` |
|---|---|---|---|
| GET | `/admin/topics` | `?include=items` | `[Topic]` with items when requested |
| POST | `/admin/topics` | `{ name, description?, goal }` | `Topic` |
| PATCH | `/admin/topics/:id` | partial of the above | `Topic` |
| DELETE | `/admin/topics/:id` | — | `{ id }` |
| POST | `/admin/items` | `{ topicId, type, korean, meaningVi, romanization?, exampleKo?, exampleVi?, audioUrl? }` | `Item` |
| PATCH | `/admin/items/:id` | partial of the above | `Item` |
| DELETE | `/admin/items/:id` | — | `{ id }` |
| GET | `/admin/users` | `?current=&pageSize=` | paginated `[{ id, email, goal, locked }]` |
| PATCH | `/admin/users/:id/lock` | `{ locked: boolean }` | `{ id, locked }` |
| GET | `/admin/stats` | — | `{ totalUsers, byGoal: { conversation, topik }, topTopics: [{ topicId, name, learners }] }` |

Validation: `korean`, `meaningVi` and `topicId` are required on item create. An item cannot exist without a topic. Deleting a topic with items requires a confirmation step in the frontend. A locked user cannot log in (`403 ACCOUNT_LOCKED`).

## 10. Decisions to confirm

1. Minimum password length: 8 characters.
2. Access token only, expires after 1 day, no refresh token in v1.
3. Image upload: jpg, png, webp, max 5 MB.
4. TTS returns base64 JSON instead of a binary stream.
5. Sections 7 and 8 stay Proposed until the PRD is revised.
6. A locked user is blocked at login and rejected with `403` on later requests.
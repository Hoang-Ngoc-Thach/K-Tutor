# API Contract

**Status:** Draft — pending team approval

Single source of truth for the frontend, backend and AI service. Derived from `3.5-feature-specification.md`. Sections marked **(Proposed)** go beyond the accepted PRD and need a PRD revision before implementation.

## 1. Conventions

| Topic            | Rule                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Base URL         | `/api/v1`. Local: `http://localhost:3000/api/v1`. All paths below are relative to it                            |
| Frontend config  | `VITE_BACKEND_URL=http://localhost:3000/api/v1`, so the frontend `api/` layer calls paths like `/topics`        |
| Auth             | `Authorization: Bearer <accessToken>`. Missing or expired token → `401` (frontend redirects to Login)           |
| Roles            | `learner`, `admin`. Admin routes (`/admin/*`) reject learners with `403`                                        |
| Success envelope | `{ "statusCode": 200, "message": "...", "data": ... }`                                                          |
| Error shape      | NestJS default: `{ "statusCode": 400, "message": "..." \| ["..."], "error": "Bad Request" }`                    |
| Naming           | JSON fields `camelCase`; ids are UUID strings; timestamps ISO 8601                                              |
| Enums            | goal: `conversation` \| `topik`; role: `learner` \| `admin`; item type: `vocabulary` \| `grammar`               |
| Pagination       | Query `current` (1-based) and `pageSize`; response `data: { items: [...], meta: { current, pageSize, total } }` |
| AI calls         | The frontend only talks to the NestJS backend. The backend calls Gemini and `ai-service` (OCR/TTS)              |
| UI language      | Messages shown to users are produced by the frontend in Vietnamese; API `message` strings are English           |

## 2. Auth

| Method | Path             | Body                  | Success `data`                                     | Errors                                               |
| ------ | ---------------- | --------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| POST   | `/auth/register` | `{ email, password }` | `{ id, email }` (201)                              | 400 invalid email / short password, 409 email exists |
| POST   | `/auth/login`    | `{ email, password }` | `{ accessToken, user: { id, email, role, goal } }` | 401 invalid credentials, 403 `ACCOUNT_LOCKED`        |
| GET    | `/auth/me`       | —                     | `{ id, email, role, goal }`                        | 401                                                  |
| PATCH  | `/users/me/goal` | `{ goal }`            | `{ goal }`                                         | 400                                                  |

`goal` is `null` until the user picks one. `goal === null` after login means: show goal selection first. Progress under a previous goal is kept when the goal changes.

## 3. Learning path

| Method | Path                           | Notes                                                                                                                                                   | Success `data`            |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| GET    | `/levels`                      | Available levels, ordered by `sortOrder`                                                                                                                | `[Level]`                 |
| GET    | `/levels/:id`                  | One level                                                                                                                                               | `Level`                   |
| POST   | `/levels`                      | Admin only; body `{ name, description?, sortOrder? }`                                                                                                   | `Level`                   |
| PATCH  | `/levels/:id`                  | Admin only; partial level fields                                                                                                                        | `Level`                   |
| DELETE | `/levels/:id`                  | Admin only                                                                                                                                              | `{ id }`                  |
| GET    | `/topics?levelId=<uuid>`       | Logged-in users; required level UUID; ordered by `sortOrder`; each topic includes `vocabularyCount` and `grammarCount`                                  | `[Topic]`                 |
| GET    | `/topics/:id`                  | Logged-in users; one topic                                                                                                                              | `Topic`                   |
| POST   | `/topics`                      | Admin only; body `{ name, levelId, description?, sortOrder? }`                                                                                          | `Topic`                   |
| PATCH  | `/topics/:id`                  | Admin only; partial topic fields, optional `levelId`                                                                                                    | `Topic`                   |
| DELETE | `/topics/:id`                  | Admin only                                                                                                                                              | `{ id }`                  |
| GET    | `/vocabularies?topicId=<uuid>` | Logged-in users; required topic UUID; ordered by `sortOrder`, then `createdAt`; each vocabulary includes examples ordered by `createdAt`                | `[Vocabulary]`            |
| GET    | `/vocabularies/:id`            | Logged-in users; one vocabulary with examples ordered by `createdAt`                                                                                    | `Vocabulary`              |
| GET    | `/grammars?topicId=<uuid>`     | Logged-in users; required topic UUID; ordered by `sortOrder`, then `createdAt`; each grammar includes examples ordered by `sortOrder`, then `createdAt` | `[Grammar]`               |
| GET    | `/grammars/:id`                | Logged-in users; one grammar with examples                                                                                                              | `Grammar`                 |
| POST   | `/grammars`                    | Admin only; body `{ title, content, topicId, sortOrder?, examples: [{ korean, meaning }] }`; examples required, 1–20                                    | `Grammar` with `examples` |
| PATCH  | `/grammars/:id`                | Admin only; partial grammar fields; optional `examples` replaces all existing examples (1–20 when supplied)                                             | `Grammar` with `examples` |
| DELETE | `/grammars/:id`                | Admin only; deleting a grammar cascades to its examples                                                                                                 | `{ id }`                  |

`Topic`:

```json
{
  "id": "uuid",
  "name": "Chào hỏi",
  "description": null,
  "sortOrder": 0,
  "levelId": "uuid",
  "vocabularyCount": 12,
  "grammarCount": 5,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

Topic names must be unique within a level. Creating or moving a topic requires an existing `levelId`; deleting a level cascades to its topics.
The vocabulary list requires `topicId`; a missing or invalid UUID returns `400`, and a topic that does not exist returns `404 TOPIC_NOT_FOUND`. A missing vocabulary returns `404 VOCABULARY_NOT_FOUND`.
Grammar examples require non-empty `korean` and `meaning` strings of at most 500 characters; both values are trimmed. Examples are stored with `grammarId`, `vocabularyId: null`, and `sortOrder` matching their array position. Grammar creation and example creation, as well as grammar updates and example replacement, each run in a single transaction. Omitting `examples` in a PATCH leaves existing examples unchanged. The grammar list requires `topicId`; a missing or invalid UUID returns `400`, and an unknown topic returns `404 TOPIC_NOT_FOUND`. An unknown grammar returns `404 GRAMMAR_NOT_FOUND`.

`Grammar` response example:

```json
{
  "id": "uuid",
  "title": "N + 이에요/예요",
  "content": "<p>Giới thiệu danh từ.</p>",
  "sortOrder": 0,
  "topicId": "uuid",
  "examples": [
    {
      "id": "uuid",
      "korean": "저는 학생이에요.",
      "meaning": "Tôi là học sinh.",
      "grammarId": "uuid",
      "vocabularyId": null,
      "sortOrder": 0,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## 4. Vocabulary review

| Method | Path                                | Notes                                                                                                  | Success `data`                                                                                                                                                               |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/topics/:id/review?format=&limit=` | `format`: `type-meaning` \| `type-korean` \| `match-pairs`                                             | `{ format, questions: [{ itemId, prompt }] }`; for `match-pairs`: `{ format, pairs: { korean: [{ itemId, text }], meaning: [{ itemId, text }] } }` (meaning column shuffled) |
| POST   | `/topics/:id/review/submit`         | Body `{ format, answers: [{ itemId, answer }] }`; answers are compared after trimming and case-folding | `{ correct, total, revisit: [{ itemId, korean, meaningVi }] }`                                                                                                               |

A review session does not change learned/not-learned state in v1.

## 5. Scan to speech

| Method | Path        | Body                                                            | Success `data`              | Errors                                                                             |
| ------ | ----------- | --------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| POST   | `/scan/ocr` | `multipart/form-data`, field `image` (jpg, png, webp, max 5 MB) | `{ text }`                  | 400 unsupported format or too large, 422 no readable text, 502 OCR service failure |
| POST   | `/scan/tts` | `{ text }` (max 500 characters)                                 | `{ audioBase64, mimeType }` | 400 empty or too long, 502 TTS service failure                                     |

The frontend plays the audio from a data URL built from `audioBase64`. Nothing is stored.

## 6. Sentence practice

| Method | Path                 | Body           | Success `data`                                                | Errors                                      |
| ------ | -------------------- | -------------- | ------------------------------------------------------------- | ------------------------------------------- |
| POST   | `/practice/sentence` | `{ sentence }` | `{ isCorrect, explanationVi, correctedSentence, suggestion }` | 400 empty, 429 rate limited, 502 AI failure |

Single-turn: each request is evaluated alone. `correctedSentence` is `null` when `isCorrect` is true; `suggestion` is optional.

## 7. TOPIK practice (Proposed)

| Method | Path                                  | Notes                                                                 | Success `data`                                                                                             |
| ------ | ------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET    | `/topik/exams`                        | List imported exams                                                   | `[{ id, name, level, hasListening, hasReading }]`                                                          |
| GET    | `/topik/exams/:id/questions?section=` | `section`: `reading` \| `listening`. Correct answers are not included | `[{ id, number, section, prompt, audioUrl, choices: [string], grammarTags: [string] }]`                    |
| POST   | `/topik/exams/:id/submit`             | Body `{ answers: [{ questionId, choice }] }`                          | `{ score, correct, total, results: [{ questionId, correct, correctChoice, explanationVi, grammarTags }] }` |

Exams are imported from seed JSON by an admin or a seed script, not scraped at runtime.

## 8. AI chat with feedback (Proposed)

| Method | Path                      | Body                           | Success `data`                                                                                                              |
| ------ | ------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/chat/messages`          | `{ conversationId?, message }` | `{ conversationId, reply, feedback: { corrections: [{ original, corrected, explanationVi }], vocabularyNotes: [string] } }` |
| GET    | `/chat/conversations/:id` | —                              | `{ id, messages: [{ role, content, createdAt }] }`                                                                          |

Contradicts the PRD non-goal "open chatbot": needs a PRD revision first.

## 9. Admin (role `admin`)

| Method | Path                    | Body / query                                                                                                                                                     | Success `data`                                                                                                                                                                                                                                                        |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/admin/users`          | `?current=&pageSize=&search=&goal=&locked=`; `search` matches email; lists learners only, newest first                                                           | `{ items: [{ id, email, role, goal, locked, createdAt }], meta, summary: { total, active, locked } }`; `summary` counts all learners and ignores the filters                                                                                                          |
| PATCH  | `/admin/users/:id/lock` | `{ locked: boolean }`                                                                                                                                            | `{ id, locked }`; 404 `USER_NOT_FOUND`, 403 `CANNOT_LOCK_ADMIN`                                                                                                                                                                                                       |
| GET    | `/admin/stats`          | —                                                                                                                                                                | `{ totalUsers, byGoal: { conversation, topik }, totalTopics, topicsByLevel: [{ levelId, name, count }], totalVocabularies, totalGrammars, vocabulariesWithExamples }`; `totalUsers` counts learners only                                                              |
| GET    | `/admin/contents`       | `?current=&pageSize=&search=&type=&topicId=`; `type`: `vocabulary` \| `grammar`; `search` matches korean, pronunciation and meaning (grammar: title and content) | `{ items: [{ id, type, korean, pronunciation, meaning, topicId, topicName, createdAt }], meta, summary: { all, vocabulary, grammar } }`; for grammar, `korean` is the title and `meaning` is the content; `summary` follows `search` and `topicId` but ignores `type` |
| POST   | `/vocabularies`         | `{ korean, meaning, topicId, pronunciation?, sortOrder? }`                                                                                                       | `Vocabulary`; 404 `TOPIC_NOT_FOUND`                                                                                                                                                                                                                                   |
| PATCH  | `/vocabularies/:id`     | Partial vocabulary fields, optional `topicId`                                                                                                                    | `Vocabulary`; 404 `VOCABULARY_NOT_FOUND` / `TOPIC_NOT_FOUND`                                                                                                                                                                                                          |
| POST   | `/vocabularies/import`  | `multipart/form-data`: `file` (.xlsx) and `topicId`; columns `Từ tiếng Hàn` (required), `Phát âm`, `Nghĩa tiếng Việt` (required)                                 | `{ imported }`; all-or-nothing                                                                                                                                                                                                                                        |
| DELETE | `/vocabularies/:id`     | —                                                                                                                                                                | `{ id }`; its example sentences are deleted too                                                                                                                                                                                                                       |
| POST   | `/grammars`             | `{ title, content, topicId, sortOrder? }`                                                                                                                        | `Grammar`; 404 `TOPIC_NOT_FOUND`                                                                                                                                                                                                                                      |
| PATCH  | `/grammars/:id`         | Partial grammar fields, optional `topicId`                                                                                                                       | `Grammar`; 404 `GRAMMAR_NOT_FOUND` / `TOPIC_NOT_FOUND`                                                                                                                                                                                                                |
| POST   | `/grammars/import`      | `multipart/form-data`: `file` (.xlsx) and `topicId`; columns `Ngữ pháp` and `Giải thích`, both required                                                          | `{ imported }`; all-or-nothing                                                                                                                                                                                                                                        |
| DELETE | `/grammars/:id`         | —                                                                                                                                                                | `{ id }`; its example sentences are deleted too                                                                                                                                                                                                                       |

All endpoints in this section and the vocabulary/grammar writes are admin-only. Learner-facing reads of vocabulary and grammar are not implemented yet. Learning content endpoints use `/topics` rather than `/admin/topics`; topic create/update/delete are admin-only. Deleting a topic with vocabularies or grammar requires a confirmation step in the frontend. A locked user cannot log in (`403 ACCOUNT_LOCKED`). Example sentences have no endpoints yet.

Excel import (`POST /vocabularies/import`, `POST /grammars/import`): only the first sheet is read, row 1 is the header (matched by name, column order does not matter), blank rows are skipped, and the limits are 2 MB and 500 data rows. Rows are appended to the topic after its current highest `sortOrder`, in file order. Every row is validated first: if any row is invalid nothing is saved and the response is `400 { message: 'IMPORT_INVALID_ROWS', total, errors: [{ row, field, code }] }` (at most 50 errors listed; `code` is `REQUIRED`, `TOO_LONG`, `DUPLICATE_IN_FILE` or `DUPLICATE_EXISTING`; a duplicate is the same korean/title and meaning/content within the topic, case-insensitive). Other errors: `400 IMPORT_FILE_REQUIRED`, `IMPORT_INVALID_FILE` (not a .xlsx), `IMPORT_EMPTY`, `IMPORT_MISSING_COLUMNS { columns }`, `IMPORT_TOO_MANY_ROWS { max }`, `413` (file over 2 MB), `404 TOPIC_NOT_FOUND`. Templates for admins live in `frontend/public/templates`.

## 10. Decisions to confirm

1. Minimum password length: 8 characters.
2. Access token only, expires after 1 day, no refresh token in v1.
3. Image upload: jpg, png, webp, max 5 MB.
4. TTS returns base64 JSON instead of a binary stream.
5. Sections 7 and 8 stay Proposed until the PRD is revised.
6. A locked user is blocked at login and rejected with `403` on later requests.

# AI Prompt Engineering Log & Evidence of AI Usage

**Project:** K-Tutor — Smart Korean Learning System
**Course:** CS2028 — AI Product Development: End to End
**Serves evaluation:** CLO2 (30%), CLO3 (35%)

## 1. AI usage strategy for Chapter 3

The team used AI (Claude) in an **AI-Assisted** model to support the requirements and product-analysis stage (not AI-Native in the product's features — the product's only AI-native feature is OCR + TTS, which belongs to a later technical chapter). AI was used to: ask clarifying questions about the raw idea, draft documents against a standard PRD structure, and push back on repository-structure decisions before they were finalized.

## 2. Prompt iteration & critique log

| ID | Purpose | Initial prompt/request | Issue found / pushback | Result after iteration |
|---|---|---|---|---|
| PR-01 | Clarify the product idea (Product Discovery) | "I have a newly created K-Tutor repo, this week starts at Chapter 3, what should I do to maximize my grade?" | AI proposed a generic structure based on the syllabus, but didn't yet know the target users, specific features, or team size | AI asked closed-ended questions to clarify: target learners (conversation/TOPIK), core features (learning path, OCR, TTS), team size (2 people) — only then was the project brief drafted with the right scope |
| PR-02 | Draft the PRD using the instructor's sample repo | AI proposed following the `chapter-0X/prompts+docs` structure from the sample TaskFlow repo on Drive | The user pushed back: the nested structure is hard to manage for a 2-person team, and observed that other groups in the class don't follow this template | AI inspected 20 real classmate GitHub repos directly (via git clone) and found that all of them use a flat `docs/` structure — abandoned the Drive template approach entirely |
| PR-03 | Finalize the folder structure | "What's the standard folder [structure] for a maximum grade?" | AI compared multiple real repos (KIZUNA, TripMindAI, Luminex, kanji_recognizer, EngCoach, Omaishort...) instead of relying on a single source; noted that Omaishort, while technically impressive, has a docs structure that doesn't map to the syllabus — not a good template to follow | Settled on a structure combining the strengths of three repos: file names matching syllabus section numbers (TripMindAI), a `docs/README.md` index (Luminex), and a dedicated prompt log (KIZUNA) |
| PR-04 | Write the detailed PRD (Chapter 3) | Requested a PRD and feature spec based on the approved brief | The first draft left 3 assumptions open (TOPIK level, voice cloning, data source) instead of deciding them unilaterally | The user answered directly via the AI's multiple-choice questions (keep both TOPIK levels, drop voice cloning from v1 scope, needed advice on a free data source) — AI updated the PRD to match those decisions exactly, without inventing scope |

## 3. Lessons learned

- The AI's initial suggestion (following the instructor's sample) was not automatically the best fit for the team's actual situation — it needed to be checked against real evidence (classmates' repos) rather than applied mechanically.
- Every product assumption (scope, target users, excluded features) was raised as a question by the AI rather than guessed, and only finalized after direct human confirmation.
- No AI output was used verbatim — every document went through at least one round of critique or revision before being treated as final.
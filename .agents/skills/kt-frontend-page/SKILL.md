---
name: kt-frontend-page
description: Create or modify screens, components, routes and API calls in the K-Tutor web frontend (React + Vite + Tailwind). Use when the user asks to add a page, admin screen, table, form, modal, flashcard or practice UI, or to connect a page to the backend API, even if they don't mention React, Tailwind or the admin area.
---

# K-Tutor frontend

Code lives in `frontend/`. Read `kt-project-context` first for the domain and roadmap.

## Stack (verified from frontend/package.json)

React 19 + Vite 8, plain JavaScript (`.jsx`, no TypeScript), Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`), `lucide-react` icons, `react-router-dom` v7. Do not add dependencies (axios, MUI, ...) unless the user asks.

## Where files go

```
frontend/src/
├── api/           client.js (apiFetch), auth.js, <resource>.js
├── context/       AuthProvider.jsx, authContext.js, useAuth.js
├── hooks/         custom hooks (e.g. useSpeak)
├── pages/admin/, pages/user/, pages/auth/
├── components/admin/, user-side folders, auth/ (ProtectedRoute, forms)
├── layout/admin/AdminSidebar.jsx, layout/user/
└── App.jsx        all routes (flat <Routes>)
```

## Calling the backend

- Always go through `apiFetch(path, { method, body, auth })` in `src/api/client.js`. Never call `fetch` or hardcode the base URL in a page. `VITE_BACKEND_URL` already includes `/api/v1`, so paths look like `/levels`.
- `apiFetch` adds the Bearer token, returns the response `data` (envelope already unwrapped), and throws `ApiError(status, message)` (status `0` = server unreachable). A 401 on an authenticated call clears the token and fires `auth:unauthorized`.
- One file per resource in `src/api/`, modeled on `auth.js`: small functions such as `getLevelsRequest()`, `createLevelRequest(body)`, plus a `getXErrorMessage(error)` that maps status or backend codes (`LEVEL_NAME_EXISTS`, `LEVEL_NOT_FOUND`, `FORBIDDEN`) to **Vietnamese** text. Backend messages are English and are never shown directly.
- Page pattern: `useState` for data, loading and error; load in `useEffect`; show "Đang tải...", an error line, and an empty state; refresh the list after create / update / delete.
- Current user: `const { user, loading, login, logout } = useAuth()`.

## Routes and auth

Add routes in `App.jsx`. Learner pages: `<ProtectedRoute>`. Admin pages: `<ProtectedRoute role="admin">` (wrong role redirects home). Public: `/` and `/auth`.

## Steps for a new admin page

1. Copy the structure of the closest page: `AdminUsers.jsx` (table + search + modals) or `AdminDashboard.jsx` (header + cards).
2. Root is `<div className="flex bg-gray-50/60 min-h-screen">` with `<AdminSidebar />` and `<main className="flex-1 p-8 overflow-y-auto">`. Each page renders its own sidebar; there is no shared layout route.
3. Register the route in `App.jsx`. Only if asked, add a nav entry in `AdminSidebar.jsx` (an `isXActive` const from `useLocation`, a `<Link>` using `getNavClass` / `getIconClass`, the icon import).

## Conventions

- All UI text is Vietnamese; identifiers and comments are English.
- Palette: emerald for primary/active, gray for neutrals. `rounded-xl` / `rounded-2xl`, small text (`text-xs`, `text-sm`).
- Modals: `fixed inset-0` overlay (`z-50`, `bg-gray-900/30`), return `null` when the item prop is empty, callbacks `onClose` / `onSave` / `onConfirm`. Reference: `components/admin/ContentFormModal.jsx`, `DeleteContentModal.jsx`. Destructive actions (deleting a level or topic also deletes its children) need a confirm modal.
- Pronunciation: use the `useSpeak` hook (browser `speechSynthesis`, `ko-KR`), not audio files.
- Start files with `import React from "react"` like the existing ones.

## Current state

Admin pages (`AdminContent`, `AdminUsers`, `AdminDashboard`) still use inline mock arrays. Replace the mock with the real API one resource at a time, starting with levels, and only for the resource the user asks about.

## Rules

- Change only what the task requires. Do not rename, reformat or "clean up" existing code.
- At the end, list every existing file you modified (new files don't need listing).
- When the user confirms the work is tested, update the roadmap status in `.agents/skills/kt-project-context/SKILL.md` as described there.

## Validate before saying done

```powershell
cd frontend
npm run lint
npm run build
```

No test runner exists; also check the page manually with `npm run dev` (backend running, logged in as admin).

## Gotchas

- `ContentFormModal.jsx` default-exports a component named `EditContentModal`. Import by file path and don't "fix" the name.
- `AdminDashboard.jsx` passes `activePage` to `AdminSidebar`, but the sidebar ignores it and uses `useLocation`.
- Add a new gotcha here every time you have to correct the AI.
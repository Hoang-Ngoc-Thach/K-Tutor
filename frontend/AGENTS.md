# K-Tutor Frontend — React 19 + Vite 8 + Tailwind v4

## Stack

React 19 + Vite 8, plain JavaScript (`.jsx`, no TypeScript), Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`), `lucide-react` icons, `react-router-dom` v7. Do not add dependencies unless the user asks.

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

- Always use `apiFetch(path, { method, body, auth })` in `src/api/client.js`. Never call `fetch` directly or hardcode the base URL.
- `VITE_BACKEND_URL` already includes `/api/v1`, so paths look like `/levels`.
- `apiFetch` adds Bearer token, returns unwrapped `data`, throws `ApiError(status, message)`.
- One file per resource in `src/api/`, modeled on `auth.js`: small functions like `getLevelsRequest()` plus `getXErrorMessage(error)` mapping codes to Vietnamese.
- Page pattern: `useState` for data, loading and error; load in `useEffect`; show "Đang tải...", error line, empty state.

## Routes and auth

Add routes in `App.jsx`. Learner: `<ProtectedRoute>`. Admin: `<ProtectedRoute role="admin">`. Public: `/` and `/auth`.

## Steps for a new admin page

1. Copy the structure of the closest page: `AdminUsers.jsx` (table + search + modals) or `AdminDashboard.jsx` (header + cards).
2. Root is `<div className="flex bg-gray-50/60 min-h-screen">` with `<AdminSidebar />` and `<main className="flex-1 p-8 overflow-y-auto">`.
3. Register route in `App.jsx`. Only if asked, add nav entry in `AdminSidebar.jsx`.

## Conventions

- All UI text is Vietnamese; identifiers and comments are English.
- Palette: emerald for primary/active, gray for neutrals. `rounded-xl` / `rounded-2xl`, small text.
- Modals: `fixed inset-0` overlay (`z-50`, `bg-gray-900/30`), return `null` when item is empty.
- Pronunciation: use the `useSpeak` hook, not audio files.
- Start files with `import React from "react"`.

## Current state

Admin pages (`AdminContent`, `AdminUsers`, `AdminDashboard`, `AdminLevels`, `AdminTopics`, `AdminTopik` and `AdminTopikEditor`) call the real API. The TOPIK editor uploads exam audio and question images, edits categories and listening ranges, and deletes replaced storage files after save. Learner pages using real API data include `TopicListPage`, `FlashcardPage`, `GrammarPage`, `/review` setup, `TopikListPage` / `TopikExamPage`.

## Validate before saying done

```powershell
cd frontend
npm run lint
npm run build
```

No test runner exists; check the page manually with `npm run dev`.

## Gotchas

- `ContentFormModal.jsx` default-exports a component named `EditContentModal`. Import by file path; don't "fix" the name.
- `AdminDashboard.jsx` passes `activePage` to `AdminSidebar`, but the sidebar ignores it and uses `useLocation`.

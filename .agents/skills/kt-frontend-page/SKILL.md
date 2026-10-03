---
name: kt-frontend-page
description: Create or modify screens and UI components in the K-Tutor web frontend (React + Tailwind). Use when the user asks to add a page, admin screen, dashboard view, table, form, modal or route, even if they don't mention React, Tailwind or the admin area by name.
---

# K-Tutor frontend pages

## Stack (verified from frontend/package.json)

React 19 + Vite, plain JavaScript (`.jsx`, no TypeScript), Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`), `lucide-react` for icons, `react-router-dom` v7.
Do not add dependencies (MUI, axios, etc.) unless the user asks.

## Where files go

```
frontend/src/
├── pages/admin/, pages/user/            one component per route
├── components/admin/, user/, auth/      pieces used by pages
├── layout/admin/AdminSidebar.jsx        admin navigation
├── layout/user/Header.jsx, Footer.jsx
└── App.jsx                              all routes (flat <Routes> inside BrowserRouter)
```

## Steps for a new admin page

1. Open the closest existing page and copy its structure: `AdminUsers.jsx` (table + search + modals) or `AdminDashboard.jsx` (header + cards).
2. Page root is `<div className="flex bg-gray-50/60 min-h-screen">` containing `<AdminSidebar />` and `<main className="flex-1 p-8 overflow-y-auto">`. Every page renders its own sidebar; there is no shared layout route.
3. Register the route in `App.jsx`.
4. Only if the user asks for a nav entry: edit `AdminSidebar.jsx` — add an `isXActive` const (from `useLocation`), a new `<Link>` block using `getNavClass` / `getIconClass`, and the icon import.

## Conventions

- All UI text is Vietnamese. Code identifiers and comments are English.
- Palette: emerald for primary/active states, gray for neutrals. Shapes: `rounded-xl` / `rounded-2xl`. Text is small (`text-xs`, `text-sm`).
- Modals: `fixed inset-0` overlay (`z-50`, `bg-gray-900/30`), return `null` when the item prop is empty, callbacks named `onClose` / `onSave` / `onConfirm`. Reference: `components/admin/ContentFormModal.jsx`, `DeleteContentModal.jsx`.
- Data is currently inline mock arrays at the top of the page (e.g. `initialUsers`). There is no API layer and no auth guard yet: do not invent `fetch`/axios calls or login logic unless asked.
- Start files with `import React from 'react'` like the existing ones.

## Rules

- Change only what the task requires. Do not rename, reformat or "clean up" existing code.
- At the end, list every existing file you modified (new files don't need listing).

## Validate before saying done

```powershell
cd frontend
npm run lint
npm run build
```

There is no frontend test runner; also check the page manually with `npm run dev`.

## Gotchas

- `ContentFormModal.jsx` default-exports a component named `EditContentModal`. Import by file path and don't "fix" the name.
- `AdminDashboard.jsx` passes `activePage` to `AdminSidebar`, but the sidebar ignores it and uses `useLocation`. Don't rely on that prop.
- Add a new gotcha here every time you have to correct the AI.

---
name: kt-nestjs-module
description: Create or modify backend features in the K-Tutor NestJS API (modules, controllers, services, DTOs, TypeORM entities, auth guards and roles, MySQL connection, .env config, CORS). Use when the user asks to add an API endpoint, CRUD, database table or entity, admin-only route, or backend config, even if they don't say NestJS or TypeORM.
---

# K-Tutor backend (NestJS 10 + TypeORM + MySQL)

Code lives in `backend/`. Read `kt-project-context` first for the domain and roadmap.

## What exists

```
backend/src/
├── modules/
│   ├── auth/      register, login, /auth/me, JwtStrategy, guard/jwt-auth.guard.ts, guard/roles.guard.ts
│   ├── users/     User entity (role learner|admin, goal, locked)
│   └── learning/  entities: level, topic, vocabulary, grammar, example-sentence
│                  levels.controller.ts / levels.service.ts / dto/  <- reference implementation
├── core/transform.interceptor.ts
└── decorator/     customize.ts (@ResponseMessage), roles.decorator.ts (@Roles)
```

**For any new CRUD, copy the `levels` files in `modules/learning/` and adapt them.** Do not invent a new style.

## Conventions

- URL: global prefix `api` + URI version `1` → `/api/v1/levels`. Controllers use plural kebab-case paths. No `@Version()`.
- Response envelope `{ statusCode, message, data }` is added by `TransformInterceptor`; controllers and services return plain data. Put `@ResponseMessage('...')` (English) on every handler.
- Auth: controllers use `@UseGuards(JwtAuthGuard, RolesGuard)`. `GET` is open to any logged-in user; `POST` / `PATCH` / `DELETE` of learning content get `@Roles(UserRole.ADMIN)`.
- Errors: throw Nest exceptions with an `UPPER_SNAKE` code as message, e.g. `NotFoundException('LEVEL_NOT_FOUND')`, `ConflictException('LEVEL_NAME_EXISTS')`, `ForbiddenException('FORBIDDEN')`. The frontend maps codes to Vietnamese.
- Route params that are ids: `@Param('id', ParseUUIDPipe)`.
- DTOs: `class-validator` + `class-transformer`; trim string inputs with `@Transform`. Global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` is on. **`@nestjs/mapped-types` is NOT installed**: write `UpdateXDto` by hand with `@IsOptional()` on every field. Do not add the package unless the user asks.
- Entities: `@Entity('snake_case_plural')`, `@PrimaryGeneratedColumn('uuid')`, explicit column types, `@CreateDateColumn` / `@UpdateDateColumn`. Foreign keys: an explicit `xxxId` column (`varchar(36)`) plus `@ManyToOne(..., { onDelete: 'CASCADE' })` and `@JoinColumn({ name: 'xxxId' })`. Use `sortOrder` for ordering (`order` is a MySQL reserved word). Optional text fields are `nullable: true`.
- Duplicate-name checks are done in the service with a lookup (`assertNameAvailable(name, ignoreId?)`), not by catching DB errors.
- Register new entities in the module's `TypeOrmModule.forFeature([...])`; add new modules to `AppModule.imports`. `autoLoadEntities` and `synchronize` (non-production) create tables automatically.
- Imports are relative (no path aliases).
- Secrets only in `backend/.env` via `ConfigService`: `DATABASE_*`, `PORT`, `FRONTEND_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`. Keep `.env.example` in sync with placeholders. Never commit `.env`, never print secret values, never write real passwords into code or docs.

## Steps for a new feature

1. Check `docs/architecture/api-contract.md`; it is partly outdated (see `kt-project-context`). Propose shapes to the user, then update the file in the same task.
2. Entity (+ register in `forFeature`).
3. DTOs → service → controller → module → `AppModule`.
4. Build and test (below), then give the user ready-to-run Postman requests (login at `POST /api/v1/auth/login`, token is `data.accessToken`, send as Bearer).

## Rules

- Change only what the task requires. Do not touch `frontend/`. Tell the user which packages you add.
- At the end, list every existing file you modified (new files don't need listing).
- When the user confirms the work is tested, update the roadmap status in `.agents/skills/kt-project-context/SKILL.md` as described there.

## Validate before saying done

```powershell
cd backend
npm run build
npm test
npm run start:dev
```

## Gotchas

- `npm run lint` runs ESLint with `--fix` and rewrites files. To only check: `npx eslint "{src,test}/**/*.ts"`.
- Error `File '...' is not a module` means the file is empty or was not saved. Check that the file has content and an `export`.
- Korean text needs `utf8mb4` (already set in TypeORM; the database must use the same charset).
- Deleting a parent (level, topic) deletes its children through `onDelete: 'CASCADE'`. Warn the admin UI to confirm.
- `tsconfig` has `strictNullChecks: false`; don't "fix" it.
- Add a new gotcha here every time you have to correct the AI.
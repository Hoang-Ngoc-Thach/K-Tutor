---
name: kt-nestjs-module
description: Create or modify backend features in the K-Tutor NestJS API: modules, controllers, services, DTOs, TypeORM entities, MySQL connection, .env config, CORS. Use when the user asks to add an API endpoint, CRUD, database table or entity, backend config, or to connect the backend to MySQL, even if they don't say NestJS or TypeORM.
---

# K-Tutor backend (NestJS + TypeORM + MySQL)

## Stack

NestJS 10 (TypeScript), TypeORM + MySQL (`mysql2`), `@nestjs/config` for `.env`, `class-validator` / `class-transformer` for DTOs. Code lives in `backend/`. Backend runs on `PORT` (default 3000), the Vite frontend on 5173.

## API contract first

Read `docs/architecture/api-contract.md` before writing any endpoint. If an endpoint is not in it, propose the change to the user instead of inventing request/response shapes silently. Update the file when a shape changes.

## Folder layout (modeled on F-Corp-OS)

```
backend/src/
├── modules/<feature>/
│   ├── <feature>.module.ts, .controller.ts, .service.ts
│   ├── dto/create-<x>.dto.ts, update-<x>.dto.ts
│   └── entities/<x>.entity.ts
├── common/        enum/, types/, constants/
├── core/          transform.interceptor.ts
├── decorator/     customize.ts (@ResponseMessage, ...)
└── helper/
```

Use **relative imports**. `tsconfig.json` has `baseUrl: "./"` (the backend root, not `src`), so aliases like `modules/...` do not work here.

## Steps for a new feature module

1. Open an existing module in `modules/` and copy its structure. If none exists, follow the steps below.
2. Entity: `@Entity('topics')` (snake_case, plural), `@PrimaryGeneratedColumn('uuid')`, explicit `@Column` types, `@CreateDateColumn` / `@UpdateDateColumn`, relations with `@OneToMany` / `@ManyToOne`.
3. DTOs with `class-validator` decorators. `UpdateXDto = PartialType(CreateXDto)` from `@nestjs/mapped-types`.
4. Service: `@InjectRepository(Entity)`, throw `NotFoundException` / `BadRequestException`, return plain data (no envelope).
5. Controller: `@Controller('topics')` (plural, kebab-case), REST routes `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`, `@ResponseMessage('...')` on write endpoints.
6. Module: `TypeOrmModule.forFeature([Entity])`, then add the module to `AppModule.imports`.

## Conventions

- Global prefix `api` plus URI versioning with default version `1`: `/api/v1/topics`. Do not add `@Version()` to controllers unless a new API version is requested.
- Every response is `{ statusCode, message, data }`, produced by `TransformInterceptor`. Controllers return plain data.
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- Secrets only in `backend/.env`, read through `ConfigService`. Variables: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `PORT`, `FRONTEND_URL`, `GEMINI_API_KEY`. Keep `backend/.env.example` in sync with placeholder values. Never commit `.env`, never print secret values.
- TypeORM: `TypeOrmModule.forRootAsync` with `ConfigService`, `type: 'mysql'`, `charset: 'utf8mb4'`, `autoLoadEntities: true`, `synchronize` only when `NODE_ENV !== 'production'`.
- CORS: `enableCors({ origin: FRONTEND_URL, credentials: true })`, default `http://localhost:5173`.
- Identifiers and API messages in English.

## One-time bootstrap (only when the user asks to connect the backend to the database)

```powershell
cd backend
npm i @nestjs/config @nestjs/typeorm typeorm mysql2 class-validator class-transformer @nestjs/mapped-types
```

Then: `ConfigModule.forRoot({ isGlobal: true })` and `TypeOrmModule.forRootAsync(...)` in `app.module.ts`; prefix and versioning (`app.setGlobalPrefix('api')`, `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`), `ValidationPipe`, interceptor and CORS in `main.ts`; create `backend/.env.example`. Change nothing else. The user must create the database themselves: `CREATE DATABASE k_tutor CHARACTER SET utf8mb4;`

## Rules

- Change only what the task requires. Do not touch `frontend/`. Tell the user which packages you add.
- At the end, list every existing file you modified (new files don't need listing).

## Validate before saying done

```powershell
cd backend
npm run build
npm test
```

Then start `npm run start:dev` and test the new endpoints with the user (Postman or `curl`).

## Gotchas

- `npm run lint` runs ESLint with `--fix` and rewrites files. To only check: `npx eslint "{src,test}/**/*.ts"`.
- Korean text breaks without `utf8mb4`. Set `charset: 'utf8mb4'` in TypeORM and create the database with the same charset.
- The frontend's `VITE_BACKEND_URL` must include `/api/v1`; endpoint paths in `docs/architecture/api-contract.md` are relative to it.
- `tsconfig` has `strictNullChecks: false`; don't "fix" this.
- Add a new gotcha here every time you have to correct the AI.
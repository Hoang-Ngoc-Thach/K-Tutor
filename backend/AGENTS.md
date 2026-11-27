# K-Tutor Backend — NestJS 10 + TypeORM + MySQL

## What exists

```
backend/src/
├── modules/
│   ├── auth/      register, login, /auth/me, JwtStrategy, jwt-auth.guard, roles.guard
│   ├── users/     User entity, admin list/lock endpoints
│   ├── learning/  entities: level, topic, vocabulary, grammar, example-sentence
│   │              levels/topics: CRUD; vocabularies/grammars: CRUD + Excel imports
│   ├── admin/     Admin statistics controller and service
│   ├── topik/     Learner exam list/detail/submit; admin CRUD with audio, images, categories, listening ranges
│   └── storage/   Local and Cloudinary drivers; admin image/audio uploads and deletion
├── core/transform.interceptor.ts
└── decorator/     customize.ts (@ResponseMessage), roles.decorator.ts (@Roles)
```

**For any new CRUD, copy the `levels` files in `modules/learning/` and adapt them.** Do not invent a new style.

## Conventions

- URL: global prefix `api` + URI version `1` → `/api/v1/levels`. Controllers use plural kebab-case paths.
- Response envelope `{ statusCode, message, data }` is added by `TransformInterceptor`; controllers return plain data. Put `@ResponseMessage('...')` on every handler.
- Auth: controllers use `@UseGuards(JwtAuthGuard, RolesGuard)`. `GET` is open to any logged-in user; `POST` / `PATCH` / `DELETE` of learning content get `@Roles(UserRole.ADMIN)`.
- Errors: throw Nest exceptions with `UPPER_SNAKE` code, e.g. `NotFoundException('LEVEL_NOT_FOUND')`. The frontend maps codes to Vietnamese.
- Route params that are ids: `@Param('id', ParseUUIDPipe)`.
- DTOs: `class-validator` + `class-transformer`; trim strings with `@Transform`. Global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`. `@nestjs/mapped-types` is NOT installed: write `UpdateXDto` by hand. Do not add the package.
- Entities: `@Entity('snake_case_plural')`, `@PrimaryGeneratedColumn('uuid')`, explicit column types, `@CreateDateColumn` / `@UpdateDateColumn`. FK: explicit `xxxId` column (`varchar(36)`) + `@ManyToOne` + `@JoinColumn`. Use `sortOrder` for ordering. Optional text fields are `nullable: true`.
- Duplicate-name checks in the service (`assertNameAvailable`), not by catching DB errors.
- Register entities in `TypeOrmModule.forFeature([...])`. `autoLoadEntities` and `synchronize` create tables automatically.
- Relative imports (no path aliases).
- Secrets in `backend/.env` via `ConfigService`. Never commit `.env`, never print secrets.

## Steps for a new feature

1. Check `docs/architecture/api-contract.md` (partly outdated). Propose shapes, then update the file.
2. Entity (+ register in `forFeature`).
3. DTOs → service → controller → module → `AppModule`.
4. Build and test, then give the user Postman requests.

## Validate before saying done

```powershell
cd backend
npm run build
npm test
npm run start:dev
```

## Gotchas

- `npm run lint` runs ESLint with `--fix` and rewrites files. To only check: `npx eslint "{src,test}/**/*.ts"`.
- Error `File '...' is not a module` means the file is empty or was not saved.
- Korean text needs `utf8mb4` (already set in TypeORM).
- Deleting a parent deletes children through `onDelete: 'CASCADE'`. Warn the admin UI to confirm.
- `tsconfig` has `strictNullChecks: false`; don't "fix" it.

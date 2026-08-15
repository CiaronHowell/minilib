# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MiniLib is a personal library management system (tracking owned books, loans, reading status) built with SvelteKit 5, Drizzle ORM, and a Turso (libSQL) database.

## Commands

Package manager is **pnpm** (`engine-strict=true` in `.npmrc`, `pnpm-lock.yaml` present — use `pnpm`, not `npm`/`yarn`).

```bash
pnpm install          # install dependencies
pnpm dev              # start the Vite dev server
pnpm build            # production build
pnpm preview           # preview the production build

pnpm check            # svelte-kit sync + svelte-check (type checking) — run after changing .ts/.svelte files
pnpm check:watch      # svelte-check in watch mode

pnpm format           # prettier --write .
pnpm lint             # prettier --check . (this is the only lint step; there is no ESLint config)

pnpm db:generate      # generate a new Drizzle migration from schema changes in src/lib/server/db/schema
pnpm db:migrate       # apply pending migrations
pnpm db:push          # push schema changes directly to the DB without a migration file (dev convenience)
pnpm db:studio        # open Drizzle Studio
```

There is no test suite configured in this repository (no test runner/dependency in `package.json`, no `*.test.*`/`*.spec.*` files). Do not assume `pnpm test` exists.

`DATABASE_URL` (and `DATABASE_AUTH_TOKEN` outside of dev) must be set for the app to start — see `.env.example`. For local dev, `DATABASE_URL="file:local.db"` works against a local SQLite file; `DATABASE_AUTH_TOKEN` is required whenever `dev` is false (see `src/lib/server/db/index.ts`).

## Architecture

### Stack

- **SvelteKit 5** (Svelte 5 runes) with `adapter-auto`, TypeScript, Vite.
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + **shadcn-svelte** component primitives (`bits-ui`, `tw-animate-css`); config in `components.json` — UI aliases: `$lib/components` (`components`), `$lib/components/ui` (`ui`), `$lib/utils` (`utils`).
- **Drizzle ORM** over **libSQL/Turso** (`drizzle-orm/libsql`, `@libsql/client`), dialect `turso` in `drizzle.config.ts`.
- **sveltekit-superforms** + **Zod v4** (`zod4` adapter) for all form validation.
- Auth is hand-rolled, following the Lucia Auth reference pattern (session cookies + email/password + TOTP 2FA) using `@oslojs/*` and `@node-rs/argon2` — there is no auth library dependency, just the pattern.

### Routing & page conventions

Routes live under `src/routes`. Each protected/interactive route typically has:
- `+page.svelte` — UI, using shadcn-svelte `ui` components and `custom` components.
- `+page.server.ts` — `load` performs guard redirects and builds a `superValidate`d form; `actions` re-validates with the same Zod schema, checks rate limits, does the DB/auth work, then returns `fail(...)` or `message(form, {...})`.
- `schema.ts` (or reused from a `lib/components/custom/*` module) — the Zod schema shared between the load and the action so client and server validation stay in sync.

**Auth gate order** used throughout server `load`/`actions` (see `src/routes/+page.server.ts`, `src/routes/login/+page.server.ts`) — replicate this exact order when adding new protected routes:
1. `event.locals.session === null || event.locals.user === null` → redirect `/login`
2. `!user.emailVerified` → redirect `/verify-email`
3. `!user.registered2FA` → redirect `/2fa/setup`
4. `!session.twoFactorVerified` → redirect `/2fa`

`event.locals.user` / `event.locals.session` are populated in `src/hooks.server.ts` (`handleAuth`) by validating the `session` cookie on every request; `App.Locals` is typed in `src/app.d.ts`.

### Rate limiting

`src/hooks.server.ts` applies a global per-IP `RefillingTokenBucket` (`handleRateLimit`) ahead of auth on every request, keyed off the `X-Forwarded-For` header. Individual sensitive actions (login, book creation, etc.) layer additional per-route buckets/`Throttler`s from `src/lib/server/auth/rate-limit.ts` on top of that. When adding a new mutating action, follow the existing pattern: check the bucket, validate the form, consume the bucket, then do the work.

### Database layer

- Schema is split by domain under `src/lib/server/db/schema/` (`users.ts` — users/sessions/email-verification/password-reset; `books.ts` — books/book status/book activity). Import the shared `db` client from `src/lib/server/db/index.ts`.
- Query/mutation helpers are grouped per-domain in `src/lib/server/db/*.ts` (e.g. `books.ts` exports `addBook`/`getBooks`) and per-concern under `src/lib/server/auth/*.ts` (`user.ts`, `session.ts`, `2fa.ts`, `password.ts`, `password-reset.ts`, `email-verification.ts`, `encryption.ts`). Prefer adding new queries to these files rather than inlining Drizzle calls in route files.
- After editing a schema file, run `pnpm db:generate` to create a migration under `drizzle/` (numbered SQL files + `drizzle/meta` snapshots) — do not hand-edit files in `drizzle/`.

### Forms

Every form follows the same `sveltekit-superforms` + Zod shape: a `schema.ts` next to the `*.svelte` component (see `src/lib/components/custom/{login,register,manual-book}-form/`), re-exported via the folder's `index.ts`. Server `load` calls `superValidate(zod4(schema))`; the action re-runs `superValidate(event.request, zod4(schema))` and must not trust client-side validation alone.

### Formatting

Prettier is the sole formatter/linter (`.prettierrc`: tabs, single quotes, no trailing commas, 100 print width, `prettier-plugin-svelte` + `prettier-plugin-tailwindcss` for class sorting). Run `pnpm format` before committing; `pnpm lint` only checks, it does not fix.

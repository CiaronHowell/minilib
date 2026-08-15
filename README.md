# MiniLib

The temptation of purchasing books, even with a mounting backlog, is something I have fallen into way too often. I have even bought the same book (luckily this has only happened once!). This is why I wanted to take the time to create a basic library management system.

## Features

- Email/password authentication with mandatory TOTP-based two-factor authentication (session cookies, hand-rolled — no third-party auth library)
- Email verification and password reset flows, with recovery codes for 2FA lockout
- Add books to your library manually (title, author, ISBN-13)
- Browse your library in a sortable table

## Tech stack

- SvelteKit 5 + TypeScript + Tailwind CSS v4 (shadcn-svelte components)
- Drizzle ORM over Turso (libSQL)
- sveltekit-superforms + Zod for form validation
- Deploys to Vercel via `@sveltejs/adapter-vercel`

See `CLAUDE.md` for a deeper architecture overview.

## How to run

Requires [pnpm](https://pnpm.io) — this repo uses `engine-strict`, so npm/yarn aren't supported.

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and fill in the required values:
   - `DATABASE_URL` — for local dev, `file:local.db` works against a local SQLite file; otherwise a Turso database URL
   - `DATABASE_AUTH_TOKEN` — required outside local dev (Turso auth token)
   - `ENCRYPTION_KEY` — a base64 AES-128 key, generate with `openssl rand -base64 16`
3. Push the schema to your database:
   ```bash
   pnpm db:push
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```

> Email sending isn't wired up yet — verification and password-reset codes are printed to the server console instead of being emailed.

## Other commands

```bash
pnpm build       # production build
pnpm check       # type-check
pnpm format      # format with Prettier
pnpm lint        # check formatting
pnpm db:studio   # open Drizzle Studio
```

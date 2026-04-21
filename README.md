# Article Collector

Private article collection app built with Next.js, Prisma, PostgreSQL, and passkey authentication.

## Features

- Save article links with tags
- Fetch article titles from `og:title`, `twitter:title`, or `<title>`
- Fallback to manual title entry when fetching fails
- Search by title keyword
- Filter by tag
- Restrict access to the passkeys you register during setup

## Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- PostgreSQL via Supabase
- Passkey auth with `@simplewebauthn`

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Run `npm install`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply your schema with `npm run db:migrate`.
5. Start the app with `npm run dev`.

## Passkey setup

- Set `BOOTSTRAP_TOKEN` in `.env`
- Visit `/setup` the first time the app runs
- Enter that token and register your first passkey
- After setup completes, login happens at `/login`

When you deploy, set `APP_ORIGIN` to the full public origin. If needed, set `RP_ID` to the public hostname.

## Notes

- `BOOTSTRAP_TOKEN` should be treated like a secret and rotated after first setup.
- Deploy on any HTTPS host and use PostgreSQL for production.

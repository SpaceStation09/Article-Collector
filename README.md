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

## Vercel

This repository is set up for a standard Vercel deployment.

### Environment variables

- `DATABASE_URL`: runtime database URL. For Supabase, prefer the pooler URL.
- `DIRECT_DATABASE_URL`: direct PostgreSQL URL for Prisma migrations.
- `APP_ORIGIN`: full public origin, for example `https://your-domain.vercel.app`
- `AUTH_SECRET`: long random secret used for session signing
- `BOOTSTRAP_TOKEN`: one-time setup token for the first passkey registration
- `RP_ID`: optional when it differs from the hostname in `APP_ORIGIN`
- `RP_NAME`: optional passkey display name override

### Deploy steps

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Set all required environment variables in the Vercel project settings.
4. Deploy.
5. Visit `/setup` and register your first passkey.
6. After setup, sign in at `/login`.
7. If you add a custom domain, update `APP_ORIGIN` and `RP_ID` to match it.

### Supabase note

- For Vercel runtime traffic, using the Supabase pooler URL for `DATABASE_URL` is the safer default.
- Keep the direct `5432` connection string in `DIRECT_DATABASE_URL` for `prisma migrate`.
- Treat both URLs as secrets and never commit them.

## Notes

- `BOOTSTRAP_TOKEN` should be treated like a secret and rotated after first setup.
- Deploy on any HTTPS host and use PostgreSQL for production.
- Do not commit `.env`, `.dev.vars`, exported secrets, or database dumps.
- If `.env` was ever committed before, rotate the database password and auth secrets before going live on the new platform.

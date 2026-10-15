# With Hammad

Personal portfolio application built with **Next.js, TypeScript, React and Payload CMS**. The codebase includes content pages, API routes, interactive tools, and portfolio and project views.

Live site: [withhammad.com](https://withhammad.com)

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development uses SQLite when no database connection string is configured; production uses Postgres. Optional integrations need their own environment variables. Do not commit secrets.

## Useful scripts

- `npm run dev` — start the local development server.
- `npm run lint` — run ESLint.
- `npm run build` — build the application.

## Project notes

The application has a Payload admin and CMS, site content routes, API endpoints, and interactive tools. Its VPS deployment workflow is intentionally disabled until the server is provisioned. See [DEPLOY.md](DEPLOY.md) for the documented deployment plan and current prerequisites.

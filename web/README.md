# SuplexGym web app

The Vite app is in `apps/web`, with shared components in `packages/ui`.

## Local development

Install dependencies and run the development server from this directory:

```sh
npm ci
npm run dev --workspace=web
```

Build and check the app with `npm run build --workspace=web`, `npm run lint --workspace=web`, and `npm run typecheck --workspace=web`.

## Vercel deployment

Set the Vercel project Root Directory to `web`. The included `vercel.json` builds the `web` workspace and publishes `apps/web/dist`, with SPA route fallback for React Router.

Set `VITE_API_BASE_URL` in Vercel's Production (and Preview, if needed) environment variables to the publicly reachable HTTPS base URL of the ASP.NET API, without a trailing slash. The API must allow the deployed Vercel origin through CORS. If unset, local development continues to use the configured/local API host.

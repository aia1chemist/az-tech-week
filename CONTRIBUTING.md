# Contributor Onboarding

Welcome to **AZ Tech Week**. This guide is the practical starting point for contributors who need to run the application locally, understand where work belongs, and validate a focused change before opening a pull request.

> **Project at a glance.** The repository is a TypeScript application with a React/Vite client, an Express/tRPC server, Drizzle-based MySQL persistence, and a GitHub Actions data-refresh workflow.[1] [2] [3]

## 1. Local setup

The project declares **pnpm 10.4.1** as its package manager. The repository’s scheduled workflow uses **Node.js 22**, so use Node 22 locally when possible to stay aligned with the automated environment.[1] [4]

| Requirement | Recommended action | Why it matters |
|---|---|---|
| Node.js | Install Node.js 22 | It matches the runtime used by the repository workflow.[4] |
| Package manager | Enable Corepack, then use pnpm | The version is declared in `package.json`.[1] |
| Git | Clone from GitHub and work on a topic branch | Keep each change reviewable and isolated. |
| Optional MySQL database | Set `DATABASE_URL` only when working on persistence or migrations | Drizzle commands require it, while the runtime database layer initializes lazily when the variable is absent.[2] [5] |

Clone the repository and install locked dependencies:

```bash
git clone https://github.com/aia1chemist/az-tech-week.git
cd az-tech-week
corepack enable
pnpm install --frozen-lockfile
```

Start the development server with:

```bash
pnpm dev
```

The server starts from `server/_core/index.ts`. In development it attaches Vite; it begins searching for an available port at `3000` and reports the selected local URL in the terminal.[6]

### Environment variables

Local environment files are already ignored by Git, so keep secrets in `.env` or one of the ignored local variants and **never commit credentials**.[7] There is no tracked example environment file at present. Add only the variables required for the area you are changing.

| Variable | Use it when | Notes |
|---|---|---|
| `DATABASE_URL` | Running migrations, generating database changes, or testing persistence | Required by `drizzle.config.ts` for Drizzle commands.[2] |
| `JWT_SECRET` | Working on session or cookie behavior | Read by the server environment module.[5] |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID` | Working on application identity or authentication flows | Read by the server environment module.[5] |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | Working on built-in platform integrations such as storage or AI features | Read by the server environment module.[5] |

## 2. Validate your change

Use the project scripts rather than invoking tools with ad hoc arguments. The following commands are defined in `package.json`.[1]

| Command | Purpose | When to run it |
|---|---|---|
| `pnpm dev` | Starts the Express server with Vite in development mode | During local UI or API work |
| `pnpm check` | Runs TypeScript without emitting files | Before every pull request |
| `pnpm test` | Runs the Vitest suite | Before every pull request, especially after server changes |
| `pnpm format` | Rewrites files using Prettier | Before committing; review the resulting diff |
| `pnpm build` | Builds the Vite client and bundles the server | Before changes that affect build or deployment behavior |
| `pnpm start` | Serves the production build | For a local production smoke test after `pnpm build` |
| `pnpm db:push` | Generates and applies Drizzle migrations | Only with a valid `DATABASE_URL` and an intended database change |

Tests are configured for the Node environment and currently target server test files under `server/**/*.test.ts` and `server/**/*.spec.ts`.[8] The repository uses Prettier with 2-space indentation, semicolons, double quotes, 80-character print width, and trailing commas where valid in ES5.[9]

## 3. Project structure

The application separates UI, API, schema, and shared code. Start at the route or feature nearest to your change, then follow imports inward rather than modifying generated data or infrastructure files by default.

| Path | Responsibility | Good starting point |
|---|---|---|
| `client/src/` | React client application, styling, pages, feature components, hooks, and client data | Use this for user-facing experience changes. |
| `client/src/pages/Home.tsx` | Main application composition | Trace this file to see the primary feature modules, filtering, maps, schedules, and drawers.[10] |
| `client/src/components/` | Feature-level visual components | Add or modify UI behavior here when it belongs to a discrete feature. |
| `client/src/components/ui/` | Reusable UI primitives | Prefer these components before introducing another base control. |
| `client/src/contexts/` | Client-wide state providers | Contains theme and bookmark context. |
| `client/src/hooks/useEvents.ts` | Event-data loading, caching, filtering, sorting, grouping, and derived statistics | Begin here for search, filter, sort, or event-list behavior.[11] |
| `client/src/data/events.json` | Bundled event dataset | Treat as managed data; the scheduled scraper updates it.[4] |
| `server/_core/` | Server bootstrap, tRPC setup, auth, platform integration helpers, and Vite/static hosting | Start with `server/_core/index.ts` for server lifecycle questions.[6] |
| `server/routers.ts` | Main tRPC API surface | Start here for bookmarks, RSVP data, authentication endpoints, and digest behavior.[12] |
| `server/db.ts` | Database access and persistence helpers | Use it for users, bookmarks, subscriptions, and related persistence logic.[13] |
| `drizzle/schema.ts` | Drizzle schema and inferred database types | Change this first when the data model changes.[2] |
| `drizzle/` | Generated SQL migrations and migration metadata | Commit the intended migration with its schema change. |
| `shared/` | Types and utilities used across client and server | Use it for genuinely cross-boundary contracts. |
| `scripts/` | Event discovery and Partiful scraping scripts | Review before changing event refresh behavior.[4] |
| `.github/workflows/` | GitHub automation | The current workflow refreshes `events.json` on an hourly schedule and commits changes when the data differs.[4] |

## 4. How data moves through the application

The event experience follows a simple path. `client/src/data/events.json` provides bundled data for the client, while `useEvents.ts` also fetches the same file from the repository’s raw GitHub URL at runtime. If the live request fails, the hook silently retains the bundled dataset; it caches live results for five minutes.[11]

The scheduled workflow runs `scripts/discover-events.mjs` and `scripts/scrape-partiful.mjs`, checks whether `client/src/data/events.json` changed, and pushes an automated commit only when necessary.[4] This means contributors should keep unrelated code changes separate from automated event-data updates whenever possible.

On the server, `server/_core/index.ts` mounts tRPC at `/api/trpc` and uses the router defined in `server/routers.ts`.[6] [12] The router owns the primary server-side capabilities: optional authentication, persistent bookmarks, live RSVP data, and daily-digest subscription and preview flows.[12]

## 5. Key files to know before editing

| File | Why it matters | Edit it when… |
|---|---|---|
| [`package.json`](./package.json) | Defines package versions and every supported development, build, test, formatting, and migration command.[1] | You need a dependency or script change. |
| [`client/src/App.tsx`](./client/src/App.tsx) | Defines top-level providers and page routes. | You are adding a page or changing shared client wrappers. |
| [`client/src/pages/Home.tsx`](./client/src/pages/Home.tsx) | Composes the core event-discovery experience. | You are changing the primary screen or a major user flow.[10] |
| [`client/src/hooks/useEvents.ts`](./client/src/hooks/useEvents.ts) | Owns event loading and client-side filter/sort logic. | You are changing event data behavior.[11] |
| [`client/src/data/types.ts`](./client/src/data/types.ts) | Defines the client-side event data contract and display constants. | You change the shape or presentation taxonomy of event data. |
| [`server/_core/index.ts`](./server/_core/index.ts) | Boots Express, tRPC, and Vite/static serving. | You need to change server startup or middleware.[6] |
| [`server/routers.ts`](./server/routers.ts) | Defines the main API procedures. | You are adding or changing a server endpoint.[12] |
| [`server/db.ts`](./server/db.ts) | Provides persistence helpers and graceful no-database behavior. | You are changing data access logic.[13] |
| [`drizzle/schema.ts`](./drizzle/schema.ts) | Declares the MySQL data model. | Your feature changes stored data.[2] |
| [`drizzle.config.ts`](./drizzle.config.ts) | Configures Drizzle for MySQL migrations. | You need to run or troubleshoot migration tooling.[2] |
| [`scripts/discover-events.mjs`](./scripts/discover-events.mjs) and [`scripts/scrape-partiful.mjs`](./scripts/scrape-partiful.mjs) | Refresh the event catalog and RSVP fields. | You are changing data ingestion or refresh logic.[4] |
| [`.github/workflows/scrape-partiful.yml`](./.github/workflows/scrape-partiful.yml) | Schedules and commits automated event refreshes. | You are changing automation timing or workflow behavior.[4] |

## 6. Suggested contribution workflow

The repository does not currently define a separate contribution policy, so use this lightweight workflow unless a maintainer gives more specific direction.

1. Create a focused branch, such as `feat/event-filter`, `fix/digest-preview`, or `docs/onboarding`.
2. Make the smallest complete change in the directory that owns the behavior. Keep UI, API, schema, and data-refresh changes separate unless they are inseparable.
3. Add or update server tests when changing API behavior, authorization, persistence, or a defect that could regress. Existing tests provide examples in `server/*.test.ts`.[8]
4. Run `pnpm check` and `pnpm test`. Run `pnpm format`, then inspect the diff because it rewrites files.[1]
5. If you changed the data model, update `drizzle/schema.ts`, generate the intended migration, and review the SQL before committing it.[2]
6. Do not commit `.env` files, credentials, local build output, or incidental automated event-data updates unrelated to your work.[4] [7]
7. Open a pull request that explains the user-visible effect, affected areas, validation performed, and any environment or migration requirements.

## 7. Common first tasks

| If you want to… | Start here |
|---|---|
| Add or refine a homepage experience | `client/src/pages/Home.tsx`, then the relevant `client/src/components/` file.[10] |
| Change filters, search, event grouping, or sort order | `client/src/hooks/useEvents.ts` and `client/src/data/types.ts`.[11] |
| Add an API procedure | `server/routers.ts`, then the relevant helper in `server/` or `server/_core/`.[12] |
| Change bookmarks, digest subscribers, or RSVP persistence | `server/db.ts` and `drizzle/schema.ts`.[13] |
| Change the event feed or scheduled scraping | `scripts/` and `.github/workflows/scrape-partiful.yml`.[4] |
| Add a server test | Follow the existing `server/*.test.ts` pattern and run `pnpm test`.[8] |

## References

[1]: ./package.json "Package scripts, dependencies, and pnpm version"
[2]: ./drizzle.config.ts "Drizzle configuration"
[3]: ./drizzle/schema.ts "Drizzle database schema"
[4]: ./.github/workflows/scrape-partiful.yml "Hourly Partiful scraping workflow"
[5]: ./server/_core/env.ts "Server environment variables"
[6]: ./server/_core/index.ts "Express and Vite server entry point"
[7]: ./.gitignore "Ignored environment files and local artifacts"
[8]: ./vitest.config.ts "Vitest configuration"
[9]: ./.prettierrc "Prettier configuration"
[10]: ./client/src/pages/Home.tsx "Primary client page"
[11]: ./client/src/hooks/useEvents.ts "Event data hook"
[12]: ./server/routers.ts "tRPC application router"
[13]: ./server/db.ts "Database access helpers"

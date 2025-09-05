1) pnpm create vite@latest cloudflare-vite-tutorial --template react-ts

2) install drizzle from [Drizzle Docs](https://orm.drizzle.team/docs/get-started/d1-new)
3) pnpm add @cloudflare/workers-types better-auth better-auth-cloudflare drizzle-orm
4) mkdir ./src/auth/ and touch auth.ts in it
5) mkdir ./src/db and touch schema.ts and index.ts. In schema.ts we put schema which is export and imported by index.ts
6) set env.d.ts file in same dir as index.ts of hono
7) add wrangler.toml is json??
8) pnpx @better-auth/cli generate --config=./src/auth/index.ts and copy auth-schema.ts file to schema.ts file
9) set.env file
10) pnpm drizzle-kit push
12) update index.ts file of workers dir




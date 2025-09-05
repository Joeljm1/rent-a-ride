import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { cors } from "hono/cors";
import { createAuth } from "../lib/auth";
import { users } from "../db/schema";
import type { CloudflareBindings } from "./env";

type Variables = {
  auth: ReturnType<typeof createAuth>;
};
const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

app.use(
  "/api/auth/**",
  cors({
    origin: "http://localhost:5173", // In production, replace with your actual domain
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = createAuth(c.env, (c.req.raw as any).cf || {});
  c.set("auth", auth);
  await next();
});

app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  console.log(c.req.path);
  return auth.handler(c.req.raw);
});
// Handle all auth routes
app.get("/api/db", async (c) => {
  const db = drizzle(c.env.DB);
  const row = await db.select().from(users);
  return c.json(row);
});

app.get("/api/", (c) => c.json({ name: "Joel" }));
app.get("/api/env", (c) => c.json({ env: c.env.BETTER_AUTH_URL }));
app.get("/api/name", (c) => c.json({ name: "test" }));

export default app as never;

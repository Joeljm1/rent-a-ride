import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { cors } from "hono/cors";
import { createAuth } from "../lib/auth";
import { users } from "../db/schema";
import carApp from "./vehicles";
import type { CloudflareBindings } from "./env";
import type { Variables } from "./types";

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>()
  .use(
    "/api/auth/**",
    cors({
      origin: [
        "http://localhost:5173",
        "https://car-rental.joeltest.workers.dev/",
      ], // In production, replace with your actual domain
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )

  .use("*", async (c, next) => {
    console.log(c.req.path);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth = createAuth(c.env, (c.req.raw as any).cf || {});
    const db = drizzle(c.env.DB);
    c.set("auth", auth);
    c.set("db", db);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }
    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  })

  .all("/api/auth/*", async (c) => {
    const auth = c.get("auth");
    return auth.handler(c.req.raw);
  })

  // Handle all auth routes
  .get("/api/db", async (c) => {
    try {
      const db = c.get("db");
      const row = await db.select().from(users);
      return c.json(row);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Error", error: e }, 500);
    }
  })

  .get("/api/", (c) => c.json({ name: "Joel" }))

  .get("/api/name", (c) => c.json({ name: "test" }))

  .route("/api/cars", carApp);
export default app;
export type AppType = typeof app;

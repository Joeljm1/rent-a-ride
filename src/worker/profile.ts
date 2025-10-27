import type { Variables } from "./types";
import type { CloudflareBindings } from "./env";
import { Hono } from "hono";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const profileRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>()
  // Get user profile
  .get("/", async (c) => {
    try {
      const user = c.get("user");
      if (user === null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }

      const db = c.get("db");
      const userProfile = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          image: users.image,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (userProfile.length === 0) {
        return c.json({ message: "User not found" }, 404);
      }

      return c.json(userProfile[0], 200);
    } catch (err) {
      console.error(`Error fetching profile: ${err}`);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });

export default profileRouter;

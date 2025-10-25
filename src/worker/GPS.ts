import type { Variables } from "./types";
import type { CloudflareBindings } from "./env";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { verify } from "../lib/hash";
import { requests } from "../db/schema";
import { eq } from "drizzle-orm";

const GPSRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>().post(
  "/updateLoc",
  zValidator(
    "json",
    z.object({
      gpsId: z.string(),
      gpsPass: z.string(),
      lat: z.number(),
      lon: z.number(),
    }),
  ),
  async (c) => {
    const db = c.get("db");
    const { gpsId, gpsPass, lat, lon } = c.req.valid("json");
    const resp = await db
      .select({ pass: requests.gpsPass })
      .from(requests)
      .where(eq(requests.gpsId, gpsId));
    if (resp.length === 0) {
      return c.json(
        {
          error: "GPS ID not found ",
        },
        404,
      );
    }
    const isValid = await verify({
      hash: resp[0].pass as string,
      password: gpsPass,
    });
    if (!isValid) {
      return;
    }
  },
);

export default GPSRouter;

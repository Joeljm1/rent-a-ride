import type { Variables } from "./types";
import type { CloudflareBindings } from "./env";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { carPics, cars, requests } from "../db/schema";
import { and, eq, lt } from "drizzle-orm";
import { Hono } from "hono";

const carReq = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>()
  .post(
    "/rent",
    zValidator(
      "json",
      z.object({
        id: z.coerce.number().int(),
        from: z.coerce.date(),
        to: z.coerce.date(),
        msg: z.string(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        const db = c.get("db");
        if (user === null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const { id, from, to, msg } = c.req.valid("json");
        const car = await db
          .select()
          .from(cars)
          .where(and(eq(cars.id, id), eq(cars.status, "available")))
          .limit(1);
        if (car.length == 0) {
          return c.json({ message: "Car Not Found or Unavailable" }, 404);
        }
        if (car[0].userId === user.id) {
          return c.json({ message: "Cannot rent your own car" }, 400);
        }
        try {
          // not sure if id needed
          const reqID = await db
            .insert(requests)
            .values({
              carId: id,
              requestedBy: user.id,
              rentedFrom: from,
              rentedTo: to,
              reqMessage: msg,
            })
            .returning({ reqID: requests.id });
        } catch (e) {
          console.error(`Error inserting to db :${e}`);
          return c.json(
            { message: "Failed to create request, try again" },
            500,
          );
        }
        return c.json({ message: "Rental Requested" }, 200);
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  //prolly should pagnate it later
  .get("/myPendingReq", async (c) => {
    try {
      const user = c.get("user");
      const db = c.get("db");
      if (user == null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      const req = await db
        .select()
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .leftJoin(
          carPics,
          and(eq(carPics.carId, cars.id), eq(carPics.isCover, true)),
        )
        .where(
          and(
            eq(cars.status, "available"),
            eq(requests.requestedBy, user.id),
            eq(requests.status, "pending"),
            lt(requests.rentedFrom, new Date()),
          ),
        );
      return c.json(
        req.map((r) => ({
          id: r.requests.id,
          carBrand: r.cars.brand,
          carModel: r.cars.model,
          carYear: r.cars.year,
          carPic: r.carPics ? r.carPics.url : null,
          reqAt: r.requests.requestedAt,
          from: r.requests.rentedFrom,
          to: r.requests.rentedTo,
          message: r.requests.reqMessage,
          //check sql query
          status: "pending",
          price: r.cars.pricePerDay,
        })),
        200,
      );
    } catch (err) {
      console.error(err);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });

export default carReq;

import type { Variables } from "./types";
import type { CloudflareBindings } from "./env";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { carPics, cars, requests, users } from "../db/schema";
import { hash } from "../lib/hash";
import { and, desc, eq, gte, lt, SQL } from "drizzle-orm";
import { Hono } from "hono";
import BaseURL from "../../BaseURL";

const picBaseURL =
  BaseURL == "https://car-rental.joeltest.workers.dev"
    ? `https://pub-032f94942a2e444fa6cc5af38ce60e9e.r2.dev/`
    : "../assets/hono.svg";

function secureRandomAlphaNum(len = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}

const carReq = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>()
  // add a request to a car if available
  .post(
    "/rent",
    zValidator(
      "json",
      z.object({
        carId: z.coerce.number().int(),
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
        const { carId, from, to, msg } = c.req.valid("json");
        const car = await db
          .select()
          .from(cars)
          .where(and(eq(cars.id, carId), eq(cars.status, "available")))
          .limit(1);
        if (car.length == 0) {
          return c.json({ message: "Car Not Found or Unavailable" }, 404);
        }
        if (car[0].userId === user.id) {
          return c.json({ message: "Cannot rent your own car" }, 400);
        }
        try {
          // not sure if id needed
          // const reqID =
          await db
            .insert(requests)
            .values({
              carId: carId,
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
  //history of all requests i have made
  .get(
    "/allMyReq",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        filter: z
          .enum([
            "all",
            "pending",
            "approved",
            "rejected",
            "cancelled",
            "completed",
            "expired", // request where there is pending status and rent from date was before today
          ])
          .default("all"),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const { page, pageSize, filter } = c.req.valid("query");
        let filters: SQL<unknown>[] = [];
        filters.push(eq(requests.requestedBy, user.id));
        if (filter !== "all" && filter !== "expired" && filter !== "pending") {
          filters.push(eq(requests.status, filter));
        } else if (filter === "expired") {
          filters.push(eq(requests.status, "pending"));
          filters.push(lt(requests.rentedFrom, new Date()));
        } else if (filter === "pending") {
          filters.push(eq(requests.status, "pending"));
          filters.push(gte(requests.rentedFrom, new Date()));
        }
        const db = c.get("db");
        const req = await db
          .select()
          .from(requests)
          .innerJoin(cars, eq(requests.carId, cars.id))
          .leftJoin(
            carPics,
            and(eq(carPics.carId, cars.id), eq(carPics.isCover, true)),
          )
          .where(and(...filters))
          .orderBy(desc(requests.requestedAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize);
        const resp = req.map((r) => ({
          id: r.requests.id,
          carId: r.cars.id,
          carBrand: r.cars.brand,
          carModel: r.cars.model,
          carYear: r.cars.year,
          reqAt: r.requests.requestedAt,
          from: r.requests.rentedFrom,
          to: r.requests.rentedTo,
          status:
            r.requests.rentedFrom <= new Date() &&
            r.requests.status === "pending"
              ? "expired"
              : r.requests.status,
          carPic: r.carPics?.url ? picBaseURL + r.carPics.url : picBaseURL,
          price: r.cars.pricePerDay,
          hasGPS: r.cars.gps,
          gpsId: r.requests.gpsId,
        }));
        return c.json(resp, 200);
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  //prolly should pagnate it later
  // requests i have made
  // .get("/myPendingReq", async (c) => {
  //   try {
  //     const user = c.get("user");
  //     if (user == null) {
  //       return c.json({ message: "UnAuthorized" }, 401);
  //     }
  //     const db = c.get("db");
  //     const req = await db
  //       .select()
  //       .from(requests)
  //       .innerJoin(cars, eq(requests.carId, cars.id))
  //       .innerJoin(
  //         carPics,
  //         and(eq(carPics.carId, cars.id), eq(carPics.isCover, true)),
  //       )
  //       .where(
  //         and(
  //           // should also consider like a if currently not available but current req will end before our startt date
  //           eq(cars.status, "available"),
  //           eq(requests.requestedBy, user.id),
  //           eq(requests.status, "pending"),
  //           lt(requests.rentedFrom, new Date()),
  //         ),
  //       );
  //     return c.json(
  //       req.map((r) => ({
  //         id: r.requests.id,
  //         carBrand: r.cars.brand,
  //         carModel: r.cars.model,
  //         carYear: r.cars.year,
  //         carPic: picBaseURL + r.carPics.url,
  //         reqAt: r.requests.requestedAt,
  //         from: r.requests.rentedFrom,
  //         to: r.requests.rentedTo,
  //         message: r.requests.reqMessage,
  //         //check sql query
  //         status: "pending",
  //         price: r.cars.pricePerDay,
  //       })),
  //       200,
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     return c.json({ message: "Internal Server Error" }, 500);
  //   }
  // })
  // pending requests to my cars
  .get("/pendingRequests", async (c) => {
    try {
      const user = c.get("user");
      if (user == null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      const db = c.get("db");
      const req = await db
        .select({
          request: requests,
          car: cars,
          carPic: carPics,
          requester: users,
        })
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .leftJoin(
          carPics,
          and(eq(cars.id, carPics.carId), eq(carPics.isCover, true)),
        )
        .innerJoin(users, eq(requests.requestedBy, users.id))
        .where(
          and(
            eq(cars.userId, user.id),
            eq(requests.status, "pending"),
            gte(requests.rentedFrom, new Date()),
          ),
        )
        .orderBy(desc(requests.requestedAt));

      const resp = req.map((elem) => ({
        reqId: elem.request.id,
        requestedAt: elem.request.requestedAt,
        rentedFrom: elem.request.rentedFrom,
        rentedTo: elem.request.rentedTo,
        reqMessage: elem.request.reqMessage,
        status: "pending",
        carId: elem.car.id,
        brand: elem.car.brand,
        model: elem.car.model,
        year: elem.car.year,
        pic: elem.carPic?.url ? picBaseURL + elem.carPic.url : picBaseURL,
        pricePerDay: elem.car.pricePerDay,
        requesterName: elem.requester.name,
        requesterEmail: elem.requester.email,
        requesterImage: elem.requester.image,
      }));
      return c.json(resp);
    } catch (err) {
      console.error(err);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })
  // approved requests to my cars
  .get("/approvedRequests", async (c) => {
    try {
      const user = c.get("user");
      if (user == null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      const db = c.get("db");
      const req = await db
        .select({
          request: requests,
          car: cars,
          carPic: carPics,
          requester: users,
        })
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .leftJoin(
          carPics,
          and(eq(cars.id, carPics.carId), eq(carPics.isCover, true)),
        )
        .innerJoin(users, eq(requests.requestedBy, users.id))
        .where(
          and(
            eq(cars.userId, user.id),
            eq(requests.status, "approved"),
            gte(requests.rentedFrom, new Date()),
          ),
        )
        .orderBy(desc(requests.requestedAt));

      const resp = req.map((elem) => ({
        reqId: elem.request.id,
        requestedAt: elem.request.requestedAt,
        rentedFrom: elem.request.rentedFrom,
        rentedTo: elem.request.rentedTo,
        reqMessage: elem.request.reqMessage,
        status: "approved",
        carId: elem.car.id,
        brand: elem.car.brand,
        model: elem.car.model,
        year: elem.car.year,
        pic: elem.carPic?.url ? picBaseURL + elem.carPic.url : picBaseURL,
        pricePerDay: elem.car.pricePerDay,
        requesterName: elem.requester.name,
        requesterEmail: elem.requester.email,
        requesterImage: elem.requester.image,
        gpsId: elem.request.gpsId,
        carStatus: elem.car.status,
      }));
      return c.json(resp);
    } catch (err) {
      console.error(err);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })
  // need to verify this later
  .post(
    "/handleReq",
    zValidator(
      "json",
      z.object({
        // request id
        reqId: z.coerce.number().int(),
        action: z.enum(["approve", "reject"]), //??
        rejectReason: z.string().optional(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const { reqId: id, action, rejectReason: reason } = c.req.valid("json");
        const db = c.get("db");
        const req = await db
          .select()
          .from(requests)
          .innerJoin(cars, eq(requests.carId, cars.id))
          .where(and(eq(requests.id, id), eq(cars.userId, user.id)))
          .limit(1);
        if (req.length == 0) {
          return c.json({ message: "Request Not Found" }, 404);
        }
        if (req[0].requests.status != "pending") {
          return c.json({ message: "Request already handled" }, 400);
        }

        // if (req[0].cars.status != "available") {
        //   return c.json({ message: "Car not available" }, 400);
        // }
        if (action == "approve") {
          // try {
          // why tf is transaction not working
          // D1 DOES NOT SUPPORT TRANSACTIONS !!!!!!!!!!!!!!!!!!!!!! 😡
          //   await db.transaction(async (tx) => {
          //     await tx
          //       .update(requests)
          //       .set({ status: "approved" })
          //       .where(eq(requests.id, id));
          //     await tx
          //       .update(cars)
          //       .set({ status: "approved" })
          //       .where(eq(cars.id, req[0].cars.id));
          //   });
          // } catch (e) {
          //   console.error(`Error updating db :${e}`);
          try {
            const carId = req[0].requests.carId;
            // console.log(`Approving request ${id} for car ${req[0].cars.id}`);
            //
            // // Update request status
            // await db
            //   .update(requests)
            //   .set({ status: "approved" })
            //   .where(eq(requests.id, id));
            //
            // console.log(`Request ${id} updated successfully`);
            //
            // // Update car status using the carId from the request
            // await db
            //   .update(cars)
            //   .set({ status: "approved" })
            //   .where(eq(cars.id, carId));
            //
            await db.batch([
              db
                .update(requests)
                .set({ status: "approved" })
                .where(eq(requests.id, id)),

              // Update car status using the carId from the request
              db
                .update(cars)
                .set({ status: "approved" })
                .where(eq(cars.id, carId)),
            ]);
            console.log(`Car ${carId} updated successfully`);

            return c.json({ message: "Request Approved" }, 200);
          } catch (error) {
            console.error(`Error approving request: ${error}`);
            return c.json(
              { message: "Failed to approve request, try again" },
              500,
            );
          }
        } else if (action == "reject") {
          //reject
          try {
            await db
              .update(requests)
              .set({ status: "rejected", rejectReason: reason || "" })
              .where(eq(requests.id, id));
          } catch (e) {
            console.error(`Error updating db :${e}`);
            return c.json(
              { message: "Failed to reject request, try again" },
              500,
            );
          }
          return c.json({ message: "Request Rejected" }, 200);
        } else {
          return c.json({ message: "Request invalid" }, 400);
        }
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  // Cancel a rental request (user can cancel their own pending request)
  .post(
    "/cancelReq",
    zValidator(
      "json",
      z.object({
        reqId: z.coerce.number().int(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const { reqId: id } = c.req.valid("json");
        const db = c.get("db");

        // Verify user owns this request and it's in pending status
        const req = await db
          .select()
          .from(requests)
          .where(and(eq(requests.id, id), eq(requests.requestedBy, user.id)))
          .limit(1);

        if (req.length == 0) {
          return c.json({ message: "Request Not Found" }, 404);
        }

        if (req[0].status != "pending") {
          return c.json({ message: "Can only cancel pending requests" }, 400);
        }

        try {
          await db
            .update(requests)
            .set({ status: "cancelled" })
            .where(eq(requests.id, id));

          return c.json({ message: "Request Cancelled Successfully" }, 200);
        } catch (e) {
          console.error(`Error cancelling request: ${e}`);
          return c.json(
            { message: "Failed to cancel request, try again" },
            500,
          );
        }
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  // .post(
  //   "/sendcar",
  //   zvalidator(
  //     "json",
  //     z.object({
  //       // car id
  //       requestid: z.number(),
  //     }),
  //   ),
  //   async (c) => {
  //     try {
  //       const user = c.get("user");
  //       if (user == null) {
  //         return c.json({ message: "unauthorized" }, 401);
  //       }
  //       const { carid, gpsid, gpspass } = c.req.valid("json");
  //       const validgpspass = gpspass
  //         ? gpspass.length > 5 && gpspass.length < 20
  //         : false;
  //       const db = c.get("db");
  //       // let carid=await db
  //       //   .update(cars)
  //       //   .set({ status: "renting" })
  //       //   .where(
  //       //     and(
  //       //       eq(cars.id, id),
  //       //       eq(cars.userid, user.id),
  //       //       eq(cars.status, "approved"),
  //       //     ),
  //       //   ).returning({ id: cars.id });
  //       let carid: { id: number; gps: boolean }[] = [];
  //       let passhash: string | undefined = undefined;
  //       if (gpsid && gpspass && gpspass.length > 0) {
  //         passhash = await hash(gpspass);
  //       }
  //       // await db.transaction(async (tx) => {
  //       //   carid = await tx
  //       //     .update(cars)
  //       //     .set({ status: "renting" })
  //       //     .where(
  //       //       and(
  //       //         eq(cars.id, carid),
  //       //         eq(cars.userid, user.id),
  //       //         eq(cars.status, "approved"),
  //       //       ),
  //       //     )
  //       //     .returning({ id: cars.id, gps: cars.gps });
  //       //   if (carid.length == 0) {
  //       //     return c.json({ message: "car not found or available" }, 404);
  //       //   }
  //       //   if (carid[0].gps && (gpsid == undefined || gpspass == undefined)) {
  //       //     throw new error("gps details required for this car");
  //       //   }
  //       //
  //       //   if (carid[0].gps) {
  //       //     await tx
  //       //       .update(requests)
  //       //       .set({ gpsid: gpsid, gpspass: passhash })
  //       //       .where(
  //       //         and(eq(requests.carid, carid), eq(requests.status, "approved")),
  //       //       );
  //       //   }
  //       // });

  //       try {
  //         const carresult = await db
  //           .update(cars)
  //           .set({ status: "renting" })
  //           .where(
  //             and(
  //               eq(cars.id, carid),
  //               eq(cars.userid, user.id),
  //               eq(cars.status, "approved"),
  //             ),
  //           )
  //           .returning({ id: cars.id, gps: cars.gps });

  //         if (carresult.length === 0) {
  //           return c.json({ message: "car not found or available" }, 404);
  //         }

  //         const car = carresult[0];
  //         if (car.gps && (!gpsid || !validgpspass)) {
  //           // revert car status
  //           await db
  //             .update(cars)
  //             .set({ status: "approved" })
  //             .where(eq(cars.id, carid));
  //           if (!validgpspass) {
  //             return c.json(
  //               {
  //                 error: "password length must bebetween 5 and 20",
  //               },
  //               422,
  //             );
  //           }
  //           return c.json(
  //             {
  //               error: "gps details required for this car",
  //             },
  //             422,
  //           );
  //         }

  //         if (car.gps) {
  //           await db
  //             .update(requests)
  //             .set({ gpsid: gpsid, gpspass: passhash })
  //             .where(
  //               and(eq(requests.carid, carid), eq(requests.status, "approved")),
  //             );
  //         }

  //         return c.json({ message: "car rented successfully" });
  //       } catch (err) {
  //         console.error(err);
  //         return c.json({ message: "error during rental process" }, 500);
  //       }
  //       return c.json({ message: "car is sent for rent" }, 200);
  //     } catch (err) {
  //       console.error(err);
  //       // if (
  //       //   err instanceof error &&
  //       //   err.message === "gps details required for this car"
  //       // ) {
  //       //   return c.json({ message: err.message }, 400);
  //       // }
  //       return c.json({ message: "internal server error" }, 500);
  //     }
  //   },
  // );
  .post(
    "/sendCar",
    zValidator(
      "json",
      z.object({
        requestId: z.number(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const db = c.get("db");
        const { requestId } = c.req.valid("json");
        const req = await db
          .select({ carId: requests.carId })
          .from(requests)
          .innerJoin(cars, eq(cars.id, requests.carId))
          .where(
            and(
              eq(requests.id, requestId),
              eq(cars.userId, user.id),
              eq(cars.status, "approved"),
            ),
          );
        if (req.length == 0) {
          return c.json({ message: "Request Not Found" }, 404);
        }
        const rand = secureRandomAlphaNum();
        const carId = req[0].carId;
        try {
          await db.batch([
            db
              .update(cars)
              .set({ status: "renting" })
              .where(eq(cars.id, carId)),
            db
              .update(requests)
              .set({ gpsId: rand })
              .where(eq(requests.id, requestId)),
          ]);
        } catch (err) {
          console.log(`Error: ${err}`);
          await db
            .update(cars)
            .set({ status: "approved" })
            .where(eq(cars.id, carId));
          return c.json({ error: "Internal Server Error" }, 500);
        }

        return c.json({
          gpsId: rand,
          reqId: requestId,
        });
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .post(
    "/storePass",
    zValidator(
      "json",
      z.object({
        reqId: z.number(),
        password: z.string().min(8).max(20),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const db = c.get("db");
        const { reqId, password } = c.req.valid("json");
        const req = await db
          .select({ id: requests.id })
          .from(requests)
          .innerJoin(cars, eq(requests.carId, cars.id))
          .where(
            and(
              eq(requests.id, reqId),
              eq(cars.userId, user.id),
              eq(cars.status, "renting"),
            ),
          );
        if (req.length == 0) {
          return c.json({ error: "Request Not Found" }, 404);
        }
        const passHash = await hash(password);
        await db
          .update(requests)
          .set({ gpsPass: passHash })
          .where(eq(requests.id, reqId));
        return c.json({ message: "successful" });
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .post(
    "/complete",
    zValidator(
      "json",
      z.object({
        reqId: z.number(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user == null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const db = c.get("db");
        const { reqId } = c.req.valid("json");
        const req = await db
          .select({ reqId: requests.id, carId: cars.id })
          .from(requests)
          .innerJoin(cars, eq(cars.id, requests.carId))
          .where(
            and(
              eq(requests.id, reqId),
              eq(cars.userId, user.id),
              eq(cars.status, "renting"),
            ),
          );
        if (req.length == 0) {
          return c.json({ error: "Request Not Found" }, 404);
        }
        const carId = req[0].carId;
        //rollback???
        await db.batch([
          db
            .update(requests)
            .set({ status: "completed" })
            .where(eq(requests.id, reqId)),
          db
            .update(cars)
            .set({ status: "available" })
            .where(eq(cars.id, carId)),
        ]);
      } catch (err) {
        console.log(`Error: ${err}`);
        return c.json(
          {
            error: "Internal Server Error",
          },
          500,
        );
      }
    },
  );
export default carReq;

// .get("/allMyReq", async (c) => {
//   try {
//     const user = c.get("user");
//     if (user == null) {
//       return c.json({ message: "UnAuthorized" }, 401);
//     }
//     const db = c.get("db");
//   } catch (err) {
//     console.error(err);
//     return c.json({ message: "Internal Server Error" }, 500);
//   }
// })

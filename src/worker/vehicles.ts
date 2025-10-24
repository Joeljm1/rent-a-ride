import type {
  AvailableCars,
  CarPics,
  Variables,
  CarPicWithID,
  AvailableCarPicsWithCarID,
  CarList,
  MyAvailableCars,
  MyCarList,
} from "./types";
import type { CloudflareBindings } from "./env";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { cars, carPics, requests, users } from "../db/schema";
import {
  and,
  eq,
  exists,
  not,
  inArray,
  sql,
  desc,
  asc,
  gte,
  like,
  or,
  SQL,
} from "drizzle-orm";
import { Hono } from "hono";

export const carSort = [
  "newest",
  "oldest",
  "lowMileage",
  "highMileage",
  "lowDistance",
  "highDistance",
] as const;

export const carTransmission = ["all", "manual", "automatic"] as const;
export const carType = [
  "all",
  "free",
  "unavailable",
  "renting",
  "approved",
] as const;

const carApp = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>()
  .post(
    "/addCar",
    zValidator(
      "form",
      z.object({
        //TODO: need to do file checking
        // file: z.file(),
        brand: z.string(),
        model: z.string(),
        distance: z.coerce.number().int(),
        year: z.coerce.number().int(),
        seats: z.coerce.number().int(),
        description: z.string(),
        fuelType: z.string(),
        transmission: z.string(),
        Cover: z.coerce.number().int(),
        mileage: z.coerce.number(),
        pricePerDay: z.coerce.number().int(),
        gps: z.coerce.boolean().optional().default(false),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user === null) {
          return c.json({ message: "Unauthorized" }, 401);
        }
        // TODO: Re-enable email verification once email sending is working
        // if (!user.emailVerified) {
        //   return c.json({ message: "Please verify your email first" }, 401);
        // }
        //not validating data here
        const body = await c.req.parseBody();
        const {
          brand,
          model,
          distance,
          year,
          seats,
          description,
          fuelType,
          transmission,
          Cover,
          mileage,
          pricePerDay,
          gps,
        } = c.req.valid("form");
        const pics: CarPics[] = [];
        for (let i = 0; i < 5; i++) {
          const nextFile = body[`file_${i}`] as File;
          if (nextFile === undefined) {
            break;
          }
          const cb: CarPics = {
            file: nextFile,
            // isCover: `${i}` === body["Cover"],
          };
          pics.push(cb);
        }
        // console.log(pics);
        const db = c.get("db");
        const carIds = await db
          .insert(cars)
          .values({
            userId: user.id,
            brand: brand.toLowerCase(),
            description: description,
            distanceUsed: distance,
            fuelType: fuelType.toLowerCase(),
            model: model.toLowerCase(),
            seats: seats,
            transmission: transmission.toLowerCase(),
            year: year,
            mileage: mileage,
            pricePerDay: pricePerDay,
            gps: gps,
            createdAt: new Date(), // Explicitly set createdAt
          })
          .returning({ id: cars.id});
        const carId = carIds[0]; // cause only 1 inserted
        const r2Obj = await Promise.all(
          pics.map((pic) =>
            c.env.R2.put(`${carId.id}_${pic.file.name}`, pic.file),
          ),
        );
        const carPriceRows = r2Obj
          // @ts-ignore
          .map((obj, i) => {
            if (obj?.key === undefined) {
              return;
            }
            return {
              carId: carId.id,
              url: obj?.key,
              isCover: `${i}` === (body["Cover"] as string),
            };
          })
          // @ts-ignore
          .filter((carPriceRow) => carPriceRow !== undefined);
        await db.insert(carPics).values([...carPriceRows]);
        return c.json({ message: "Created" }, 201);
      } catch (err) {
        console.error("Error adding car:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        return c.json(
          {
            message: "Internal Server Error",
            error: err instanceof Error ? err.message : String(err),
          },
          500,
        );
      }
    },
  )

  .get(
    "/vehicleList",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        sortBy: z.enum(carSort).default("newest"),
        brand: z.string().optional(),
        fuelType: z.string().optional(),
        transmission: z.enum(carTransmission).default("all"),
        minSeats: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
      }),
    ),
    async (c) => {
      try {
        const db = c.get("db");
        const {
          page,
          pageSize,
          sortBy,
          brand,
          fuelType,
          transmission,
          minSeats,
          search,
        } = c.req.valid("query");

        // const filterConditions = [
        //   not(
        //     exists(
        //       db
        //         .select()
        //         .from(requests)
        //         .where(
        //           and(
        //             eq(requests.carId, cars.id),
        //             eq(requests.status, "approved"),
        //             eq(cars.status, "available"),
        //           ),
        //         ),
        //     ),
        //   ),
        // ];

        const filterConditions = [eq(cars.status, "available")];

        if (brand) {
          filterConditions.push(eq(cars.brand, brand.toLowerCase()));
        }

        if (fuelType) {
          filterConditions.push(eq(cars.fuelType, fuelType.toLowerCase()));
        }
        if (transmission != "all") {
          filterConditions.push(eq(cars.transmission, transmission));
        }

        if (minSeats) {
          filterConditions.push(gte(cars.seats, minSeats));
        }

        if (search) {
          const searchTerm = `%${search.toLowerCase()}%`;
          filterConditions.push(
            or(like(cars.brand, searchTerm), like(cars.model, searchTerm))!,
          );
        }

        let sortProp: SQL<unknown> = desc(cars.year);
        switch (sortBy) {
          case "newest":
            sortProp = desc(cars.year);
            break;
          case "oldest":
            sortProp = asc(cars.year);
            break;
          case "lowMileage":
            sortProp = asc(cars.mileage);
            break;
          case "highMileage":
            sortProp = desc(cars.mileage);
            break;
          case "lowDistance":
            sortProp = asc(cars.distanceUsed);
            break;
          case "highDistance":
            sortProp = desc(cars.distanceUsed);
        }

        const whereClause = and(...filterConditions);

        const prom1 = db
          .select({ count: sql<number>`count(*)` })
          .from(cars)
          .where(whereClause);

        const prom2 = db
          .select()
          .from(cars)
          .where(whereClause)
          .orderBy(sortProp)
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        const [[{ count }], carRows] = await Promise.all([prom1, prom2]);

        const carIds = carRows.reduce((acc: number[], curr) => {
          acc.push(curr.id);
          return acc;
        }, []);

        //TODO: could optimize prev query to remove this
        const picsRows: AvailableCarPicsWithCarID[] = await db
          .select({
            id: carPics.id,
            carId: carPics.carId,
            url: carPics.url,
            isCover: carPics.isCover,
          })
          .from(carPics)
          .where(inArray(carPics.carId, carIds));

        const carPicsVal = picsRows.reduce((acc: CarPicWithID, curr) => {
          acc[curr.carId] = acc[curr.carId] || [];
          acc[curr.carId].push(curr);
          return acc;
        }, {});
        const availCars = carRows.reduce((acc: AvailableCars[], curr) => {
          acc.push({
            id: curr.id,
            distanceUsed: curr.distanceUsed,
            brand: curr.brand,
            model: curr.model,
            year: curr.year,
            fuelType: curr.fuelType,
            transmission: curr.transmission,
            seats: curr.seats,
            pics: carPicsVal[curr.id] || [],
          });
          return acc;
        }, []);
        const resp: CarList = {
          data: availCars,
          metaData: {
            page: page,
            pageSize: pageSize,
            totalPage: Math.ceil(count / pageSize),
          },
        };
        return c.json(resp);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .get(
    "/vehicle/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number().int().min(1),
      }),
    ),
    async (c) => {
      try {
        const db = c.get("db");
        const { id } = c.req.valid("param");

        // Get car details
        const carRow = await db.select().from(cars).where(eq(cars.id, id));
        if (carRow.length == 0) {
          return c.json({ message: "Car Not Found" }, 404);
        }

        // Get car pictures
        const picsRows = await db
          .select({
            id: carPics.id,
            url: carPics.url,
            isCover: carPics.isCover,
          })
          .from(carPics)
          .where(eq(carPics.carId, id));

        const car = carRow[0];
        const vehicleWithPics: AvailableCars = {
          id: car.id,
          distanceUsed: car.distanceUsed,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuelType: car.fuelType,
          transmission: car.transmission,
          seats: car.seats,
          pics: picsRows,
        };

        return c.json(vehicleWithPics);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .get(
    "details/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number().int().min(1),
      }),
    ),
    async (c) => {
      try {
        const db = c.get("db");
        const { id } = c.req.valid("param");
        const row = await db.select().from(cars).where(eq(cars.id, id));
        if (row.length == 0) {
          return c.json({ message: "Car Not Found" }, 404);
        }
        return c.json({
          id: row[0].id,
          distanceUsed: row[0].distanceUsed,
          description: row[0].description,
          brand: row[0].brand,
          model: row[0].model,
          year: row[0].year,
          fuelType: row[0].fuelType,
          transmission: row[0].transmission,
          seats: row[0].seats,
        });
      } catch (error) {
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )

  .get("/models", async (c) => {
    try {
      const db = c.get("db");
      const rows = await db.selectDistinct({ name: cars.model }).from(cars);
      const models = rows.reduce((acc: string[], curr) => {
        acc.push(curr.name);
        return acc;
      }, []);
      return c.json(models);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })

  .get("/brands", async (c) => {
    try {
      const db = c.get("db");
      const rows = await db.selectDistinct({ name: cars.brand }).from(cars);
      const brands = rows.reduce((acc: string[], curr) => {
        acc.push(curr.name);
        return acc;
      }, []);
      return c.json(brands);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })
  .get(
    "/contact:id",
    zValidator("param", z.object({ id: z.coerce.number().int().min(1) })),
    async (c) => {
      try {
        const db = c.get("db");
        const email = await db
          .select({ email: users.email })
          .from(cars)
          .innerJoin(users, eq(users.id, cars.userId))
          .where(eq(cars.id, c.req.valid("param").id));
        if (email.length == 0) {
          return c.json({ message: "Car Not Found" }, 404);
        }
        return c.json({ email: email[0].email });
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .get(
    "/myCars",
    zValidator(
      "query",
      z.object({
        type: z.enum(carType).default("all"),
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        sortBy: z.enum(carSort).default("newest"),
        brand: z.string().toLowerCase().optional(),
        fuelType: z
          .enum(["all", "petrol", "diesel", "electric", "hybrid"])
          .default("all"),
        transmission: z.enum(carTransmission).default("all"),
        minSeats: z.coerce.number().min(1).default(1),
        search: z.string().optional(),
      }),
    ),
    async (c) => {
      try {
        const {
          page,
          pageSize,
          sortBy,
          brand,
          fuelType,
          transmission,
          minSeats,
          search,
          type,
        } = c.req.valid("query");
        const user = c.get("user");
        if (user === null) {
          return c.json({ message: "UnAuthorized" }, 401);
        }
        const db = c.get("db");
        const filters = [eq(cars.userId, user.id)];
        switch (type) {
          case "unavailable":
            filters.push(eq(cars.status, "unavailable"));
            break;
          case "free":
            filters.push(eq(cars.status, "available"));
            break;
          case "renting":
            filters.push(eq(cars.status, "renting"));
            break;
          case "approved":
            filters.push(eq(cars.status, "approved"));
            break;
        }
        let sort: SQL<unknown> = desc(cars.year);
        switch (sortBy) {
          case "oldest":
            sort = asc(cars.year);
            break;
          case "newest":
            sort = desc(cars.year);
            break;
          case "lowMileage":
            sort = asc(cars.year);
            break;
        }
        if (brand) {
          filters.push(eq(cars.brand, brand));
        }

        if (transmission != "all") {
          filters.push(eq(cars.transmission, transmission));
        }

        if (fuelType != "all") {
          filters.push(eq(cars.fuelType, fuelType));
        }

        filters.push(gte(cars.seats, minSeats));

        if (search) {
          const searchTerm = `%${search.toLowerCase()}%`;
          filters.push(
            or(like(cars.brand, searchTerm), like(cars.model, searchTerm))!,
          );
        }
        const carRowsProm = db
          .select()
          .from(cars)
          .innerJoin(carPics, eq(cars.id, carPics.carId))
          // .leftJoin(rental, eq(cars.id, rental.carId))
          .where(and(...filters))
          .orderBy(sort)
          .limit(pageSize)
          .offset((page - 1) * pageSize);
        const countProm = db
          .select({ count: sql<number>`count(*)` })
          .from(cars)
          .where(and(...filters));

        const [carRows, [{ count }]] = await Promise.all([
          carRowsProm,
          countProm,
        ]);
        const carRec: Record<number, MyAvailableCars> = {};
        carRows.forEach(({ cars: car, carPics: pic }) => {
          if (!(car.id in carRec)) {
            carRec[car.id] = {
              id: car.id,
              distanceUsed: car.distanceUsed,
              brand: car.brand,
              model: car.model,
              year: car.year,
              fuelType: car.fuelType,
              transmission: car.transmission,
              seats: car.seats,
              status: car.status as
                | "available"
                | "unavailable"
                | "renting"
                | "requesting",
              pics: [
                {
                  id: pic.id,
                  url: pic.url,
                  isCover: pic.isCover,
                },
              ],
            };
          } else {
            carRec[car.id].pics.push({
              id: pic.id,
              url: pic.url,
              isCover: pic.isCover,
            });
          }
        });
        const returnData: MyCarList = {
          data: Object.values(carRec),
          metaData: {
            page: page,
            pageSize: pageSize,
            totalPage: Math.ceil(count / pageSize),
          },
        };
        return c.json(returnData);
      } catch (err) {
        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  )
  .get("/myBrands", async (c) => {
    try {
      const user = c.get("user");
      if (user === null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      const db = c.get("db");
      const rows = await db
        .selectDistinct({ name: cars.brand })
        .from(cars)
        .where(eq(cars.userId, user.id));
      const brands = rows.reduce((acc: string[], curr) => {
        acc.push(curr.name);
        return acc;
      }, []);
      return c.json(brands);
    } catch (err) {
      console.error(err);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })

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
  .patch(
    "/update/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().min(1) })),
    zValidator(
      "json",
      z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        year: z.number().int().optional(),
        distanceUsed: z.number().int().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        seats: z.number().int().optional(),
        status: z.enum(["available", "unavailable", "renting"]).optional(),
        gps: z.boolean().optional(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");
        if (user === null) {
          return c.json({ message: "Unauthorized" }, 401);
        }

        const { id } = c.req.valid("param");
        const updateData = c.req.valid("json");
        const db = c.get("db");
        //Check if changed code has problems

        // Check if car exists and belongs to user
        // const car = await db
        //   .select()
        //   .from(cars)
        //   .where(eq(cars.id, id))
        //   .limit(1);
        //
        // if (car.length === 0) {
        //   return c.json({ message: "Car not found" }, 404);
        // }
        //
        // if (car[0].userId !== user.id) {
        //   return c.json({ message: "Unauthorized: Not your vehicle" }, 403);
        // }
        //
        // // Update the car
        // await db
        //   .update(cars)
        //   .set({
        //     ...updateData,
        //     brand: updateData.brand?.toLowerCase(),
        //     model: updateData.model?.toLowerCase(),
        //     fuelType: updateData.fuelType?.toLowerCase(),
        //     transmission: updateData.transmission?.toLowerCase(),
        //   })
        //   .where(eq(cars.id, id));

        // Check if car exists and belongs to user

        // need to check if this will be same as above one
        const car = await db
          .update(cars)
          .set({
            ...updateData,
            brand: updateData.brand?.toLowerCase(),
            model: updateData.model?.toLowerCase(),
            fuelType: updateData.fuelType?.toLowerCase(),
            transmission: updateData.transmission?.toLowerCase(),
          })
          .where(and(eq(cars.id, id), eq(cars.userId, user.id)))
          .returning();
        if (car.length === 0) {
          return c.json({ message: "Car not found" }, 404);
        }
        // Update the car
        return c.json({ message: "Vehicle updated successfully" }, 200);
      } catch (err) {
        console.error("Error updating vehicle:", err);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    },
  );

export default carApp;

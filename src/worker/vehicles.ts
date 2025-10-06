import type {
  AvailableCars,
  CarPics,
  Variables,
  CarPicWithID,
  AvailableCarPicsWithCarID,
  CarList,
} from "./types";
import type { CloudflareBindings } from "./env";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { cars, carPics, rental, users } from "../db/schema";
import {
  and,
  eq,
  exists,
  not,
  inArray,
  sql,
  desc,
  gte,
  like,
  or,
} from "drizzle-orm";
import { Hono } from "hono";

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
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (user === null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      if (!user.emailVerified) {
        return c.json({ message: "Please verify your email first" }, 401);
      }
      const body = await c.req.parseBody();
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
          brand: (body["brand"] as string).toLowerCase(),
          description: body["description"] as string,
          distanceUsed: parseInt(body["distance"] as string),
          fuelType: (body["fuelType"] as string).toLowerCase(),
          model: (body["model"] as string).toLowerCase(),
          seats: parseInt(body["seats"] as string),
          transmission: (body["transmission"] as string).toLowerCase(),
          year: parseInt(body["year"] as string),
        })
        .returning({ id: cars.id });
      const carId = carIds[0]; // cause only 1 inserted
      const r2Obj = await Promise.all(
        pics.map((pic) =>
          c.env.R2.put(`${carId.id}_${pic.file.name}`, pic.file),
        ),
      );
      console.log(`r2Obj: ${r2Obj}`);
      const carPriceRows = r2Obj
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
        .filter((carPriceRow) => carPriceRow !== undefined);
      await db.insert(carPics).values([...carPriceRows]);
      return c.json({ message: "Created" }, 201);
    },
  )

  .get(
    "/vehicleList",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        sortBy: z
          .enum(["newest", "oldest", "lowMileage", "highMileage"])
          .default("newest"),
        brand: z.string().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
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

        const filterConditions = [
          not(
            exists(
              db
                .select()
                .from(rental)
                .where(
                  and(
                    eq(rental.carId, cars.id),
                    eq(rental.isComplete, false),
                    eq(cars.status, "available"),
                  ),
                ),
            ),
          ),
        ];

        if (brand) {
          filterConditions.push(eq(cars.brand, brand.toLowerCase()));
        }

        if (fuelType) {
          filterConditions.push(eq(cars.fuelType, fuelType.toLowerCase()));
        }

        if (transmission) {
          filterConditions.push(
            eq(cars.transmission, transmission.toLowerCase()),
          );
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let sortProp: any = desc(cars.year);
        switch (sortBy) {
          case "newest":
            sortProp = desc(cars.year);
            break;
          case "oldest":
            sortProp = cars.year;
            break;
          case "lowMileage":
            sortProp = cars.distanceUsed;
            break;
          case "highMileage":
            sortProp = desc(cars.distanceUsed);
            break;
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
        type: z.enum(["all", "rented", "free"]).default("all"),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (user === null) {
        return c.json({ message: "UnAuthorized" }, 401);
      }
      const db = c.get("db");
      const filters = [eq(cars.userId, user.id)];
      switch (c.req.valid("query").type) {
        case "rented":
          filters.push(eq(cars.status, "unavailable"));
          break;
        case "free":
          filters.push(eq(cars.status, "available"));
          break;
      }
      const carRows = await db
        .select()
        .from(cars)
        .innerJoin(carPics, eq(cars.id, carPics.carId))
        // .leftJoin(rental, eq(cars.id, rental.carId))
        .where(and(...filters));
      const carRec: Record<
        number,
        AvailableCars & { status: "available" | "unavailable" | "renting" }
      > = {};
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
            status: car.status as "available" | "unavailable" | "renting",
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
      return c.json(Object.values(carRec));
    },
  );
// carApp.post("/rent");
export default carApp;

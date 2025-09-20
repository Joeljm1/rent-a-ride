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
import z from "zod";
// import * as z from "zod";
import { cars, carPics, rental } from "../db/schema";
import { and, eq, exists, not, inArray, sql, desc } from "drizzle-orm";
import { Hono } from "hono";

const carApp = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();
carApp
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

  // .get("/", async (c) => {
  //   const db = c.get("db");
  //   const rows = await db
  //     .select()
  //     .from(cars)
  //     .where(
  //       not(
  //         exists(
  //           db
  //             .select()
  //             .from(rental)
  //             .where(
  //               and(eq(rental.carId, cars.id), eq(rental.isComplete, false)),
  //             ),
  //         ),
  //       ),
  //     )
  //     .innerJoin(carPics, eq(carPics.carId, cars.id));
  //   const availableCars: Record<number, AvailableCars> = {};
  //
  //   rows.forEach((row) => {
  //     if (!availableCars[row.cars.id]) {
  //       availableCars[row.cars.id] = {
  //         id: row.cars.id,
  //         distanceUsed: row.cars.distanceUsed,
  //         brand: row.cars.brand,
  //         model: row.cars.model,
  //         year: row.cars.year,
  //         fuelType: row.cars.fuelType,
  //         transmission: row.cars.transmission,
  //         seats: row.cars.seats,
  //         pics: [
  //           {
  //             id: row.carPics.id,
  //             url: row.carPics.url,
  //             isCover: row.carPics.isCover,
  //           },
  //         ],
  //       };
  //     } else {
  //       availableCars[row.cars.id].pics.push({
  //         id: row.carPics.id,
  //         url: row.carPics.url,
  //         isCover: row.carPics.isCover,
  //       });
  //     }
  //   });
  //   return c.json(availableCars);
  // })

  .get(
    "/vehicleList",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        sort: z.enum(["new", "old", "low", "high"]).default("new"),
        fuel: z
          .enum(["petrol", "diesel", "electric", "hybrid", "all"])
          .default("all"),
        transmission: z.enum(["manual", "automatic", "all"]).default("all"),
        minSeat: z.number().default(0),
      }),
    ),
    async (c) => {
      try {
        const db = c.get("db");
        const { page, pageSize, sort, fuel, transmission, minSeat } =
          c.req.valid("query");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let sortProp: any = null;
        switch (sort) {
          case "new":
            sortProp = cars.year;
            break;
          case "old":
            sortProp = desc(cars.year);
            break;
          case "low":
            sortProp = cars.distanceUsed;
            break;
          case "high":
            sortProp = desc(cars.distanceUsed);
            break;
        }
        const carRows = await db
          .select()
          .from(cars)
          .where(
            not(
              exists(
                db
                  .select()
                  .from(rental)
                  .where(
                    and(
                      eq(rental.carId, cars.id),
                      eq(rental.isComplete, false),
                    ),
                  ),
              ),
            ),
          )
          .orderBy(sortProp)
          .limit(pageSize)
          .offset((page - 1) * pageSize);
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(cars)
          .where(
            not(
              exists(
                db
                  .select()
                  .from(rental)
                  .where(
                    and(
                      eq(rental.carId, cars.id),
                      eq(rental.isComplete, false),
                    ),
                  ),
              ),
            ),
          );
        const carIds = carRows.reduce((acc: number[], curr) => {
          acc.push(curr.id);
          return acc;
        }, []);

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
  });

export default carApp;

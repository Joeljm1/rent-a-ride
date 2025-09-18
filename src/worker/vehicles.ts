import { Hono } from "hono";
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
import { and, eq, exists, not, inArray, sql } from "drizzle-orm";

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
          brand: body["brand"] as string,
          description: body["description"] as string,
          distanceUsed: parseInt(body["distance"] as string),
          fuelType: body["fuelType"] as string,
          model: body["model"] as string,
          seats: parseInt(body["seats"] as string),
          transmission: body["transmission"] as string,
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
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { page, pageSize } = c.req.valid("query");
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
                  and(eq(rental.carId, cars.id), eq(rental.isComplete, false)),
                ),
            ),
          ),
        )
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
                  and(eq(rental.carId, cars.id), eq(rental.isComplete, false)),
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
    },
  );

export default carApp;

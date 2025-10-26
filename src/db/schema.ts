import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const jwkss = sqliteTable("jwkss", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const cars = sqliteTable(
  "cars",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    distanceUsed: integer().notNull(),
    description: text(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    fuelType: text("fuel_type").notNull(),
    transmission: text("transmission").notNull(),
    seats: integer("seats").notNull(),
    // be careful as this is technically redundant data
    //available unavailable renting'
    status: text("status").default("available"),
    mileage: integer().notNull(),
    pricePerDay: integer("price_per_day").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    gps: integer("gps", { mode: "boolean" }).notNull(),
  },
  (table) => [
    check(
      "status_check",
      // renting means car is given for rent , approved means it is approved rn
      sql`${table.status} in ('available','unavailable','renting','approved')`,
    ),
  ],
);

// export const rental = sqliteTable("rental", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   carId: integer("carid")
//     .notNull()
//     .references(() => cars.id, { onDelete: "cascade" }),
//   rentedBy: text("rentedBy")
//     .references(() => users.id)
//     .notNull(),
//   rentedAt: integer("rentedAt", { mode: "timestamp" }).notNull(),
//   expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

//   isComplete: integer("isComplete", { mode: "boolean" })
//     .$defaultFn(() => false)
//     .notNull(),
// });

export const requests = sqliteTable(
  "requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    carId: integer("carId")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    requestedBy: text("requestedBy")
      .references(() => users.id)
      .notNull(),
    requestedAt: integer("requestedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    rentedFrom: integer("rentedFrom", { mode: "timestamp" }).notNull(),
    rentedTo: integer("rentedTo", { mode: "timestamp" }).notNull(),
    reqMessage: text("message").notNull(),
    rejectReason: text("rejectReason"),
    // pending, approved, rejected,cancelled,completed
    status: text("status").default("pending"),
    completedAt: integer("completedAt", { mode: "timestamp" }),
    gpsId: text("gpsId").unique(),
    gpsPass: text("gpsPass"),
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} in ('pending','approved','rejected', 'cancelled', 'completed')`,
    ),
  ],
);

export const carPics = sqliteTable("carPics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  carId: integer("carId")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // object storage URL change to filename later

  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),

  isCover: integer("is_cover", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
});

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  jwkss,
  cars,
  carPics,
  requests,
};

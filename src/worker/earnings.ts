import { Hono } from "hono";
import { eq, and, sql, desc } from "drizzle-orm";
import type { CloudflareBindings } from "./env";
import type { Variables } from "./types";
import { requests, cars } from "../db/schema";

const earningsApp = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>()
  // Get earnings statistics
  .get("/stats", async (c) => {
    try {
      const user = c.get("user");
      const db = c.get("db");

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      // Get user's cars
      const userCars = await db
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.userId, user.id));

      const carIds = userCars.map((car) => car.id);

      if (carIds.length === 0) {
        return c.json({
          totalEarnings: 0,
          monthlyEarnings: 0,
          pendingPayout: 0,
          averagePerBooking: 0,
          totalBookings: 0,
        });
      }

      // Get all completed bookings
      const completedBookings = await db
        .select({
          amount: sql<number>`${cars.pricePerDay} * (julianday(${requests.rentedTo}) - julianday(${requests.rentedFrom}))`,
          rentedFrom: requests.rentedFrom,
          status: requests.status,
        })
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .where(
          and(
            sql`${cars.id} IN ${carIds}`,
            sql`${requests.status} IN ('approved', 'completed')`
          )
        );

      // Calculate total earnings
      const totalEarnings = completedBookings
        .filter((b) => b.status === "completed")
        .reduce((sum, booking) => sum + (booking.amount || 0), 0);

      // Calculate this month's earnings
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyEarnings = completedBookings
        .filter((b) => {
          const bookingDate = new Date(b.rentedFrom);
          return bookingDate >= currentMonth && b.status === "completed";
        })
        .reduce((sum, booking) => sum + (booking.amount || 0), 0);

      // Calculate pending payout (approved but not completed)
      const pendingPayout = completedBookings
        .filter((b) => b.status === "approved")
        .reduce((sum, booking) => sum + (booking.amount || 0), 0);

      // Calculate average per booking
      const completedCount = completedBookings.filter(
        (b) => b.status === "completed"
      ).length;
      const averagePerBooking =
        completedCount > 0 ? totalEarnings / completedCount : 0;

      return c.json({
        totalEarnings: Math.round(totalEarnings),
        monthlyEarnings: Math.round(monthlyEarnings),
        pendingPayout: Math.round(pendingPayout),
        averagePerBooking: Math.round(averagePerBooking),
        totalBookings: completedCount,
      });
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })

  // Get transaction history
  .get("/transactions", async (c) => {
    try {
      const user = c.get("user");
      const db = c.get("db");

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      // Get user's cars
      const userCars = await db
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.userId, user.id));

      const carIds = userCars.map((car) => car.id);

      if (carIds.length === 0) {
        return c.json({ transactions: [] });
      }

      // Get all transactions (bookings)
      const transactions = await db
        .select({
          id: requests.id,
          carId: requests.carId,
          brand: cars.brand,
          model: cars.model,
          customerName: sql<string>`COALESCE((SELECT name FROM users WHERE id = ${requests.requestedBy}), 'Unknown')`,
          rentedFrom: requests.rentedFrom,
          rentedTo: requests.rentedTo,
          amount: sql<number>`${cars.pricePerDay} * (julianday(${requests.rentedTo}) - julianday(${requests.rentedFrom}))`,
          status: requests.status,
          completedAt: requests.completedAt,
          requestedAt: requests.requestedAt,
        })
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .where(
          and(
            sql`${cars.id} IN ${carIds}`,
            sql`${requests.status} IN ('approved', 'completed', 'cancelled')`
          )
        )
        .orderBy(desc(requests.requestedAt))
        .limit(50);

      // Transform to frontend format
      const formattedTransactions = transactions.map((t) => ({
        id: t.id,
        date: t.completedAt || t.requestedAt,
        booking: `#${t.id.toString().padStart(4, "0")}`,
        customer: t.customerName,
        vehicle: `${t.brand} ${t.model}`,
        amount: Math.round(t.amount || 0),
        status:
          t.status === "completed"
            ? "completed"
            : t.status === "approved"
              ? "pending"
              : t.status === "cancelled"
                ? "refunded"
                : "processing",
        type:
          t.status === "completed"
            ? "booking"
            : t.status === "cancelled"
              ? "refund"
              : "booking",
      }));

      return c.json({ transactions: formattedTransactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })

  // Get next payout information
  .get("/payout", async (c) => {
    try {
      const user = c.get("user");
      const db = c.get("db");

      if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      // Get user's cars
      const userCars = await db
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.userId, user.id));

      const carIds = userCars.map((car) => car.id);

      if (carIds.length === 0) {
        return c.json({
          nextPayoutDate: null,
          pendingAmount: 0,
          payoutMethod: "Bank Transfer",
        });
      }

      // Calculate pending payout (approved but not completed)
      const pendingBookings = await db
        .select({
          amount: sql<number>`${cars.pricePerDay} * (julianday(${requests.rentedTo}) - julianday(${requests.rentedFrom}))`,
        })
        .from(requests)
        .innerJoin(cars, eq(requests.carId, cars.id))
        .where(
          and(
            sql`${cars.id} IN ${carIds}`,
            eq(requests.status, "approved")
          )
        );

      const pendingAmount = pendingBookings.reduce(
        (sum, booking) => sum + (booking.amount || 0),
        0
      );

      // Calculate next payout date (e.g., 5th of next month)
      const nextPayout = new Date();
      nextPayout.setMonth(nextPayout.getMonth() + 1);
      nextPayout.setDate(5);
      nextPayout.setHours(0, 0, 0, 0);

      return c.json({
        nextPayoutDate: nextPayout.toISOString(),
        pendingAmount: Math.round(pendingAmount),
        payoutMethod: "Bank Transfer",
      });
    } catch (error) {
      console.error("Error fetching payout info:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });

export default earningsApp;

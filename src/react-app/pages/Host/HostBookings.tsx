import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import type { Booking } from "./types";

const recentBookings: Booking[] = [
    {
      id: 1,
      car: "Toyota Camry",
      customer: "Vivek Binod.",
      dates: "Oct 7-10",
      status: "confirmed",
      amount: "₹3,000",
    },
    {
      id: 2,
      car: "Honda CR-V",
      customer: "Joel Joseph",
      dates: "Oct 8-12",
      status: "pending",
      amount: "₹5,200",
    },
    {
      id: 3,
      car: "BMW 3 Series",
      customer: "Divon John",
      dates: "Oct 10-15",
      status: "confirmed",
      amount: "₹9,500",
    },
  ];

export default function HostBookings(): React.ReactElement {
  const [query, setQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");

  const filtered = useMemo(() => {
    return recentBookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        b.car.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.dates.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  // detect route to know if this component is rendered as standalone bookings page
  const location = useLocation();
  const pathname = location?.pathname || "";
  const isStandalone = pathname === "/bookings" || pathname.endsWith("/bookings") || pathname.includes("/bookings?");

  const innerContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Recent Bookings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and review recent reservations</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by car, customer, or date"
            className="ml-4 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Link to="../bookings" className="text-indigo-600 hover:underline text-sm">View All</Link>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Filter:</div>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("confirmed")}
          className={`px-3 py-1 rounded-full text-sm ${filter === "confirmed" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 rounded-full text-sm ${filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
        >
          Pending
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No bookings found. Try adjusting your search or filters.
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 rounded-lg bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg">
                  {b.car
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{b.car}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{b.customer} • {b.dates}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{b.amount}</p>
                <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  if (isStandalone) {
    return (
      <div className="w-full py-20 px-25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            {innerContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      {innerContent}
    </div>
  );
}

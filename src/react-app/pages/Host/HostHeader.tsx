import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import type { StatCard } from "./types";
import { AuthContext } from "../../AuthContext";
import client from "../../lib/client";

export default function HostHeader(): React.ReactElement {
  const session = useContext(AuthContext);
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Total Vehicles", value: "0", icon: <i className="fi fi-sr-car-alt"></i>, color: "bg-blue-500" },
    { label: "Active Bookings", value: "0", icon: <i className="fi fi-sr-calendar"></i>, color: "bg-green-500" },
    {
      label: "Monthly Earnings",
      value: "₹0",
      icon: <i className="fi fi-sr-sack-dollar"></i>,
      color: "bg-yellow-500",
    },
    { label: "Total Bookings", value: "0", icon: <i className="fi fi-sr-star"></i>, color: "bg-purple-500" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      //NOTE: Make both fetches in a Promise.all() to make both fetch concurrently

      // Fetch vehicles count (max pageSize is 100) using RPC client
      const vehiclesResponse = await client.api.cars.myCars.$get({
        query: { pageSize: "100" },
      });

      // Fetch earnings stats using RPC client
      const earningsResponse = await client.api.earnings.stats.$get();

      let totalVehicles = 0;
      let activeBookings = 0;

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        totalVehicles = vehiclesData.data?.length || 0;
        // Count vehicles that are currently rented or have active bookings
        activeBookings =
          vehiclesData.data?.filter(
            (v: { status: string }) =>
              v.status === "renting" || v.status === "requesting",
          ).length || 0;
      }

      let monthlyEarnings = 0;
      let totalBookings = 0;

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json();
        monthlyEarnings = earningsData.monthlyEarnings || 0;
        totalBookings = earningsData.totalBookings || 0;
      }

      setStats([
        {
          label: "Total Vehicles",
          value: totalVehicles.toString(),
          icon: <i className="fi fi-sc-car-alt text-gray-100"></i>,
          color: "bg-blue-500",
        },
        {
          label: "Active Bookings",
          value: activeBookings.toString(),
          icon: <i className="fi fi-sr-calendar text-gray-100"></i>,
          color: "bg-green-500",
        },
        {
          label: "Monthly Earnings",
          value: `₹${monthlyEarnings.toLocaleString()}`,
          icon: <i className="fi fi-sr-sack-dollar text-gray-100"></i>,
          color: "bg-yellow-500",
        },
        {
          label: "Total Bookings",
          value: totalBookings.toString(),
          icon: <i className="fi fi-sr-star text-gray-100"></i>,
          color: "bg-purple-500",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Welcome back, {session?.data?.user?.name || "Host"}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here's an overview of your rental business
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="../host/upload"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow"
          >
            + Add Vehicle
          </Link>
          <Link
            to="../vehicles"
            className="inline-flex items-center px-4 py-2 bg-white/6 hover:bg-white/10 text-gray-900 dark:text-gray-100 rounded shadow"
          >
            Manage Fleet
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center space-x-4 animate-pulse"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))
          : stats.map((s, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center space-x-4"
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-xl text-white ${s.color} drop-shadow-xl`}
                >
                  <span className="text-3xl mt-2">{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
      </div>
    </>
  );
}

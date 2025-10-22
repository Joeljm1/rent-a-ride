import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import type { StatCard } from "./types";
import { AuthContext } from "../../AuthContext";

export default function HostHeader(): React.ReactElement {
    const session = useContext(AuthContext);
    const [stats, setStats] = useState<StatCard[]>([
        { label: "Total Vehicles", value: "0", icon: "🚗", color: "bg-blue-500" },
        { label: "Active Bookings", value: "0", icon: "📅", color: "bg-green-500" },
        { label: "Monthly Earnings", value: "₹0", icon: "💰", color: "bg-yellow-500" },
        { label: "Total Bookings", value: "0", icon: "⭐", color: "bg-purple-500" }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            // Fetch vehicles count
            const vehiclesResponse = await fetch("/api/cars/myCars?pageSize=1000", {
                credentials: "include",
            });

            // Fetch earnings stats (includes bookings data)
            const earningsResponse = await fetch("/api/earnings/stats", {
                credentials: "include",
            });

            let totalVehicles = 0;
            let activeBookings = 0;

            if (vehiclesResponse.ok) {
                const vehiclesData = await vehiclesResponse.json();
                totalVehicles = vehiclesData.data?.length || 0;
                // Count vehicles that are currently rented or have active bookings
                activeBookings = vehiclesData.data?.filter(
                    (v: { status: string }) => v.status === "renting" || v.status === "requesting"
                ).length || 0;
            } else {
                console.error("Vehicles response not OK:", await vehiclesResponse.text());
            }

            let monthlyEarnings = 0;
            let totalBookings = 0;

            if (earningsResponse.ok) {
                const earningsData = await earningsResponse.json();
                monthlyEarnings = earningsData.monthlyEarnings || 0;
                totalBookings = earningsData.totalBookings || 0;
            } else {
                console.error("Earnings response not OK:", await earningsResponse.text());
            }

            setStats([
                { 
                    label: "Total Vehicles", 
                    value: totalVehicles.toString(), 
                    icon: "🚗", 
                    color: "bg-blue-500" 
                },
                { 
                    label: "Active Bookings", 
                    value: activeBookings.toString(), 
                    icon: "📅", 
                    color: "bg-green-500" 
                },
                { 
                    label: "Monthly Earnings", 
                    value: `₹${monthlyEarnings.toLocaleString()}`, 
                    icon: "💰", 
                    color: "bg-yellow-500" 
                },
                { 
                    label: "Total Bookings", 
                    value: totalBookings.toString(), 
                    icon: "⭐", 
                    color: "bg-purple-500" 
                }
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
                <Link to="../upload" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow">
                    + Add Vehicle
                </Link>
                <Link to="../vehicles" className="inline-flex items-center px-4 py-2 bg-white/6 hover:bg-white/10 text-gray-900 dark:text-gray-100 rounded shadow">
                    Manage Fleet
                </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center space-x-4 animate-pulse">
                            <div className="w-16 h-16 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    stats.map((s, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center space-x-4">
                            <div className={`flex items-center justify-center w-16 h-16 rounded-xl text-white ${s.color} drop-shadow-xl`}>
                                <span className="text-2xl">{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

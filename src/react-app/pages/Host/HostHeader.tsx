import React from "react";
import { Link } from "react-router";
import type { StatCard } from "./types";

export default function HostHeader(): React.ReactElement {
    const stats: StatCard[] = [
        { label: "Total Vehicles", value: "12", icon: "🚗", color: "bg-blue-500" },
        { label: "Active Bookings", value: "8", icon: "📅", color: "bg-green-500" },
        { label: "Monthly Earnings", value: "₹45,000", icon: "💰", color: "bg-yellow-500" },
        { label: "Total Reviews", value: "156", icon: "⭐", color: "bg-purple-500" }
    ];
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    Welcome back, Host!
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
                {stats.map((s, i) => (
                <div key={i} className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-xl text-white ${s.color} drop-shadow-xl`}>
                    <span className="text-2xl">{s.icon}</span>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                    </div>
                </div>
                ))}
            </div>
        </>
    );
}

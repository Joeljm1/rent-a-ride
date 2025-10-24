import React from "react";
import { Outlet, NavLink } from "react-router";
import { useState } from "react";
import type { NavLinkItem } from "./types";

export default function HostLayout(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: NavLinkItem[] = [
    { to: "/host", label: "Dashboard", icon: "📊" },
    { to: "vehicles", label: "My Vehicles", icon: "🚗" },
    { to: "upload", label: "Add Vehicle", icon: "➕" },
    { to: "bookings", label: "Bookings", icon: "📅" },
    { to: "earnings", label: "Earnings", icon: "💰" },
    { to: "profile", label: "Profile", icon: "👤" },
  ];
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-lg">
          {/* Host Header */}
          <div className="p-6 bg-blue-600 text-center dark:bg-blue-700">
            <h2 className="text-xl font-bold text-white">Host</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/host"}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Back to Main Site */}
          <div className="p-4 border-t dark:border-gray-700">
            <NavLink
              to="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to #RentARide
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          ☰
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 ml-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import type { Vehicle, VehicleStats, EditFormData } from "./types";
import client from "../../lib/client";

export default function ManageVehicles(): React.ReactElement {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "rented" | "unavailable"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.api.cars.myCars.$get({
        query: { pageSize: "100" },
      });

      if (response.status === 401) {
        setError("Please log in to view your vehicles.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to fetch vehicles" }));
        throw new Error(
          "message" in errorData
            ? errorData.message
            : "Failed to fetch vehicles",
        );
      }

      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      distanceUsed: vehicle.distanceUsed,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      status: vehicle.status === "requesting" || vehicle.status === "approved" ? "unavailable" : vehicle.status,
    });
  };

  const handleCloseEdit = () => {
    setEditingVehicle(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle || !editFormData) return;

    setSaving(true);
    try {
      const response = await client.api.cars.update[":id"].$patch({
        param: { id: editingVehicle.id.toString() },
        json: editFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      // Update local state
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editingVehicle.id ? { ...v, ...editFormData } : v,
        ),
      );

      handleCloseEdit();
    } catch (err) {
      console.error("Error updating vehicle:", err);
      alert("Failed to update vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics
  const stats: VehicleStats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === "available").length,
      rented: vehicles.filter((v) => v.status === "renting" || v.status === "approved").length,
      unavailable: vehicles.filter((v) => v.status === "unavailable").length,
    };
  }, [vehicles]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((v) => {
        if (filterStatus === "rented") {
          // Include approved (rental approved but not yet started) and renting (currently being rented)
          return v.status === "renting" || v.status === "approved";
        }
        return v.status === filterStatus;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.brand.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          `${v.brand} ${v.model}`.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [vehicles, filterStatus, searchQuery]);

  const getStatusBadge = (status: string) => {
    const badges = {
      available:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      renting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      unavailable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      requesting:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return badges[status as keyof typeof badges] || badges.available;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      available: "✓",
      renting: "🚗",
      unavailable: "✕",
      requesting: "⏳",
    };
    return icons[status as keyof typeof icons] || "•";
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: "Available",
      renting: "Currently Rented",
      unavailable: "Unavailable",
      requesting: "Pending Request",
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your vehicles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes("log in");
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8">
        <div
          className={`${isAuthError ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"} border rounded-lg p-6`}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">{isAuthError ? "🔒" : "⚠️"}</span>
            <div>
              <h3
                className={`${isAuthError ? "text-yellow-800 dark:text-yellow-200" : "text-red-800 dark:text-red-200"} font-semibold`}
              >
                {isAuthError
                  ? "Authentication Required"
                  : "Error Loading Vehicles"}
              </h3>
              <p
                className={`${isAuthError ? "text-yellow-600 dark:text-yellow-300" : "text-red-600 dark:text-red-300"} text-sm mt-1`}
              >
                {error}
              </p>
              <div className="flex gap-2 mt-3">
                {isAuthError ? (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
                  >
                    Go to Login
                  </Link>
                ) : (
                  <button
                    onClick={fetchVehicles}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Manage Vehicles
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your fleet and monitor vehicle status
          </p>
        </div>
        <Link
          to="/host/upload"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md font-medium transition-colors"
        >
          + Add New Vehicle
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total Vehicles
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-2xl">
              <span className="mt-1"><i className="fi fi-sr-car-alt mt-1"></i></span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Available
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.available}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-2xl">
              <span className="mt-1"><i className="fi fi-sr-check"></i></span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Currently Rented
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.rented}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl">
              <span className="mt-1"><i className="fi fi-sr-rent-signal"></i></span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Unavailable
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.unavailable}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-2xl">
              <span className="mt-1"><i className="fi fi-sr-triangle-warning"></i></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vehicles by brand or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-gray-400">
                <i className="fi fi-sr-search"></i>
              </span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Filter:
            </span>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All", count: stats.total },
                {
                  value: "available",
                  label: "Available",
                  count: stats.available,
                },
                { value: "rented", label: "Rented", count: stats.rented },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setFilterStatus(filter.value as typeof filterStatus)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Display */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-lg text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="text-6xl mb-4"><i className="fi fi-sr-car-alt mt-1"></i></span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {vehicles.length === 0 ? "No vehicles yet" : "No vehicles found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {vehicles.length === 0
                ? "Start building your fleet by adding your first vehicle"
                : "Try adjusting your search or filter criteria"}
            </p>
            {vehicles.length === 0 && (
              <Link
                to="/host/upload"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                Add Your First Vehicle
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const coverImage =
              vehicle.pics.find((p) => p.isCover) || vehicle.pics[0];
            return (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {coverImage ? (
                    <img
                      src={coverImage.url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      <span className="mt-1"><i className="fi fi-sr-car-alt"></i></span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}
                    >
                      {getStatusIcon(vehicle.status)}{" "}
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {vehicle.brand.charAt(0).toUpperCase() +
                      vehicle.brand.slice(1)}{" "}
                    {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {vehicle.year}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⚡</span>
                      <span className="capitalize">{vehicle.fuelType}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⚙️</span>
                      <span className="capitalize">{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">👥</span>
                      <span>{vehicle.seats} Seats</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📏</span>
                      <span>{vehicle.distanceUsed.toLocaleString()} km</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleEditClick(vehicle)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Fuel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Transmission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Distance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVehicles.map((vehicle) => {
                  const coverImage =
                    vehicle.pics.find((p) => p.isCover) || vehicle.pics[0];
                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 mr-4 overflow-hidden flex-shrink-0">
                            {coverImage ? (
                              <img
                                src={coverImage.url}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                <i className="fi fi-sr-car-alt"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {vehicle.brand.charAt(0).toUpperCase() +
                                vehicle.brand.slice(1)}{" "}
                              {vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.seats} Seats
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                        {vehicle.year}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                        {vehicle.fuelType}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                        {vehicle.transmission}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {vehicle.distanceUsed.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}
                        >
                          {getStatusIcon(vehicle.status)}{" "}
                          {getStatusText(vehicle.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/vehicles/${vehicle.id}`}
                            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleEditClick(vehicle)}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVehicle && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Vehicle
                </h2>
                <button
                  onClick={handleCloseEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        brand: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        model: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Year and Distance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Distance Used (km)
                    </label>
                    <input
                      type="number"
                      value={editFormData.distanceUsed}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          distanceUsed: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Fuel Type and Transmission */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={editFormData.fuelType}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fuelType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transmission
                    </label>
                    <select
                      value={editFormData.transmission}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          transmission: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                {/* Seats and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seats
                    </label>
                    <input
                      type="number"
                      value={editFormData.seats}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          seats: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value as EditFormData["status"],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="available">Available</option>
                      <option value="renting">Renting</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="requesting">Requesting</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseEdit}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


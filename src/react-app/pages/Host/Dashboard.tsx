import { Link } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import BaseURL from "@/../../BaseURL.ts";
import HostHeader from "./HostHeader";

type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

interface RentalRequest {
  id: number;
  carBrand: string;
  carModel: string;
  carYear: number;
  from: string;
  to: string;
  status: RequestStatus;
  carPic: string;
  price: number;
}

export default function Dashboard() {
  const [recentRequests, setRecentRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRequests = async () => {
      try {
        const response = await fetch(
          `${BaseURL}/api/rent/allMyReq?page=1&pageSize=3&filter=all`,
          { credentials: "include" },
        );
        if (response.ok) {
          const data = (await response.json()) as RentalRequest[];
          setRecentRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <HostHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Bookings - 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                My Rental Requests
              </h3>
              <Link
                to="../host/bookings"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🚗</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No rental requests yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {/* Car Image */}
                    <img
                      src={request.carPic}
                      alt={`${request.carBrand.toUpperCase()} ${request.carModel.toUpperCase()}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">
                          {request.carBrand.toUpperCase()} {request.carModel.toUpperCase()}
                        </h4>
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                            request.status,
                          )}`}
                          title={request.status}
                        ></span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.carYear} • {formatDate(request.from)} -{" "}
                        {formatDate(request.to)}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        ₹{request.price.toLocaleString()}/day
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : request.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {request.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions - 1 column on large screens */}
          <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="../upload"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <span className="text-xl">➕</span>
                <span>Add New Vehicle</span>
              </Link>
              <Link
                to="../vehicles"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <span className="text-xl">🚗</span>
                <span>Manage Vehicles</span>
              </Link>
              <Link
                to="../host/bookings"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <span className="text-xl">📅</span>
                <span>Review Bookings</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


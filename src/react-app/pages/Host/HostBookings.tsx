import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Link } from "react-router";
import BaseURL from "@/../../BaseURL.ts";

type RequestStatus = "all" | "pending" | "approved" | "rejected" | "cancelled" | "completed" | "expired";

interface RentalRequest {
  id: number;
  carId: number;
  carBrand: string;
  carModel: string;
  carYear: number;
  reqAt: string;
  from: string;
  to: string;
  status: RequestStatus;
  carPic: string;
  price: number;
  hasGPS: boolean;
  gpsId: string | null;
}

export default function HostRequests(): React.ReactElement {
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RequestStatus>("all");
  const [page, setPage] = useState<number>(1);
  const [cancellingReqId, setCancellingReqId] = useState<number | null>(null);
  const pageSize = 10;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BaseURL}/api/rent/allMyReq?page=${page}&pageSize=${pageSize}&filter=${filter}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json() as RentalRequest[];
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancelRequest = async (reqId: number) => {
    if (!confirm("Are you sure you want to cancel this rental request?")) {
      return;
    }

    try {
      setCancellingReqId(reqId);
      const response = await fetch(`${BaseURL}/api/rent/cancelReq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reqId,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { message?: string };
        throw new Error(data.message || "Failed to cancel request");
      }

      // Update the request status in the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === reqId ? { ...req, status: "cancelled" } : req
        )
      );
      
      alert("Request cancelled successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setCancellingReqId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            My Rental Requests
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Track and manage all your vehicle rental requests
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {(["all", "pending", "approved", "rejected", "cancelled", "completed", "expired"] as RequestStatus[]).map((status) => (
            <Button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full font-semibold tracking-wide transition-all ${
                filter === status
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Requests List */}
        {!loading && !error && (
          <>
            {requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No requests found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't made any rental requests yet.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Car Image */}
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img
                            src={request.carPic}
                            alt={`${request.carBrand.toUpperCase()} ${request.carModel.toUpperCase()}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Request Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {request.carBrand.toUpperCase()} {request.carModel.toUpperCase()}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.carYear} {request.hasGPS && "• GPS Enabled"}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Requested On
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(request.reqAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Rental Period
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(request.from)} - {formatDate(request.to)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {calculateDays(request.from, request.to)} days
                              </p>
                            </div>
                          </div>

                          {/* GPS ID Display */}
                          {request.gpsId && (request.status === "approved" || request.status === "completed") && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                🗺️ GPS Tracking ID:
                              </p>
                              <code className="block px-3 py-2 bg-white dark:bg-gray-800 rounded text-lg font-mono font-bold text-gray-900 dark:text-white">
                                {request.gpsId}
                              </code>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Amount
                              </p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                                ₹{(request.price * calculateDays(request.from, request.to)).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ₹{request.price}/day
                              </p>
                            </div>
                            
                            <div className="flex gap-3">
                              {request.status === "pending" && (
                                <Button 
                                  onClick={() => handleCancelRequest(request.id)}
                                  disabled={cancellingReqId === request.id}
                                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {cancellingReqId === request.id ? "Cancelling..." : "Cancel Request"}
                                </Button>
                              )}
                              
                              {request.gpsId && (request.status === "approved" || request.status === "completed") && (
                                <Link
                                  to={`/host/track/${request.gpsId}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold tracking-wide inline-flex items-center gap-2"
                                >
                                  📍 Track Vehicle
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {requests.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-4 mt-8"
              >
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                  Page {page}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={requests.length < pageSize}
                  className="px-6 py-2 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

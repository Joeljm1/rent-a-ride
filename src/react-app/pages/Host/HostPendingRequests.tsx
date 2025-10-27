import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import BaseURL from "@/../../BaseURL.ts";

interface PendingRequest {
  reqId: number;
  requestedAt: string;
  rentedFrom: string;
  rentedTo: string;
  reqMessage: string;
  status: string;
  carId: number;
  brand: string;
  model: string;
  year: number;
  pic: string;
  pricePerDay: number;
  requesterName: string;
  requesterEmail: string;
  requesterImage: string | null;
}

export default function HostPendingRequests(): React.ReactElement {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingReqId, setProcessingReqId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReqId, setRejectReqId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/api/rent/pendingRequests`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.json() as PendingRequest[];
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (reqId: number) => {
    try {
      setProcessingReqId(reqId);
      const response = await fetch(`${BaseURL}/api/rent/handleReq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reqId,
          action: "approve",
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { message?: string };
        throw new Error(data.message || "Failed to approve request");
      }

      // Remove from list after successful approval
      setRequests((prev) => prev.filter((req) => req.reqId !== reqId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReqId) return;

    try {
      setProcessingReqId(rejectReqId);
      const response = await fetch(`${BaseURL}/api/rent/handleReq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reqId: rejectReqId,
          action: "reject",
          reason: rejectReason || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { message?: string };
        throw new Error(data.message || "Failed to reject request");
      }

      // Remove from list after successful rejection
      setRequests((prev) => prev.filter((req) => req.reqId !== rejectReqId));
      setShowRejectModal(false);
      setRejectReason("");
      setRejectReqId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setProcessingReqId(null);
    }
  };

  const openRejectModal = (reqId: number) => {
    setRejectReqId(reqId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setRejectReqId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Pending Rental Requests
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Review and manage rental requests for your vehicles
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                <div className="text-6xl mb-4"><i className="fi fi-sr-suggestion"></i></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No pending requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any rental requests waiting for approval.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.reqId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Car Image */}
                        <div className="w-full lg:w-64 h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img
                            src={request.pic}
                            alt={`${request.brand} ${request.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Request Details */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {request.brand} {request.model}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.year}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Pending
                            </span>
                          </div>

                          {/* Requester Info */}
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {request.requesterImage ? (
                              <img
                                src={request.requesterImage}
                                alt={request.requesterName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                {request.requesterName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {request.requesterName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.requesterEmail}
                              </p>
                            </div>
                          </div>

                          {/* Message */}
                          {request.reqMessage && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                Message:
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {request.reqMessage}
                              </p>
                            </div>
                          )}

                          {/* Dates and Pricing */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Requested On
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {formatDate(request.requestedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Rental Period
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {new Date(request.rentedFrom).toLocaleDateString()} -{" "}
                                {new Date(request.rentedTo).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {calculateDays(request.rentedFrom, request.rentedTo)} days
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Total Amount
                              </p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400 tracking-tight">
                                ₹
                                {(
                                  request.pricePerDay *
                                  calculateDays(request.rentedFrom, request.rentedTo)
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ₹{request.pricePerDay}/day
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              onClick={() => handleApprove(request.reqId)}
                              disabled={processingReqId === request.reqId}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingReqId === request.reqId ? (
                                <span className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </span>
                              ) : (
                                "✓ Approve Request"
                              )}
                            </Button>
                            <Button
                              onClick={() => openRejectModal(request.reqId)}
                              disabled={processingReqId === request.reqId}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✕ Reject Request
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeRejectModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Reject Request
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please provide a reason for rejecting this rental request (optional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Vehicle is unavailable during this period..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={closeRejectModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processingReqId !== null}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingReqId !== null ? "Processing..." : "Confirm Reject"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

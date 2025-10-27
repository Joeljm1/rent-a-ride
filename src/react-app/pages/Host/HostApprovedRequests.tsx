import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import BaseURL from "@/../../BaseURL.ts";

interface ApprovedRequest {
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
  gpsId: string | null;
  carStatus: string;
}

export default function HostApprovedRequests(): React.ReactElement {
  const [requests, setRequests] = useState<ApprovedRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showGpsModal, setShowGpsModal] = useState<boolean>(false);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [gpsPassword, setGpsPassword] = useState<string>("");
  const [gpsPasswordError, setGpsPasswordError] = useState<string>("");
  const [processingReqId, setProcessingReqId] = useState<number | null>(null);
  const [generatedGpsId, setGeneratedGpsId] = useState<string>("");
  const [showGpsIdModal, setShowGpsIdModal] = useState<boolean>(false);
  const [selectedGpsRequest, setSelectedGpsRequest] = useState<ApprovedRequest | null>(null);

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/api/rent/approvedRequests`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch approved requests");
      }

      const data = await response.json();
      setRequests(data as ApprovedRequest[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const openGpsModal = (reqId: number) => {
    setSelectedReqId(reqId);
    setGpsPassword("");
    setGpsPasswordError("");
    setShowGpsModal(true);
  };

  const closeGpsModal = () => {
    setShowGpsModal(false);
    setGpsPassword("");
    setGpsPasswordError("");
    setSelectedReqId(null);
  };

  const closeGpsIdModal = () => {
    setShowGpsIdModal(false);
    setGeneratedGpsId("");
    setSelectedGpsRequest(null);
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setGpsPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (password.length > 20) {
      setGpsPasswordError("Password must be at most 20 characters");
      return false;
    }
    setGpsPasswordError("");
    return true;
  };

  const handleSendCar = async () => {
    if (!selectedReqId) return;

    if (!validatePassword(gpsPassword)) {
      return;
    }

    try {
      setProcessingReqId(selectedReqId);

      // Step 1: Generate GPS ID
      const sendCarResponse = await fetch(`${BaseURL}/api/rent/sendCar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          requestId: selectedReqId,
        }),
      });

      if (!sendCarResponse.ok) {
        const data = await sendCarResponse.json() as { message?: string };
        throw new Error(data.message || "Failed to send car");
      }

      const { gpsId } = await sendCarResponse.json() as { gpsId: string; reqId: number };

      // Step 2: Store GPS password
      const storePassResponse = await fetch(`${BaseURL}/api/rent/storePass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reqId: selectedReqId,
          password: gpsPassword,
        }),
      });

      if (!storePassResponse.ok) {
        const data = await storePassResponse.json() as { message?: string };
        throw new Error(data.message || "Failed to store GPS password");
      }

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.reqId === selectedReqId
            ? { ...req, gpsId: gpsId, carStatus: "renting" }
            : req
        )
      );

      // Show GPS ID modal
      setGeneratedGpsId(gpsId);
      const updatedRequest = requests.find(req => req.reqId === selectedReqId);
      if (updatedRequest) {
        setSelectedGpsRequest({ ...updatedRequest, gpsId, carStatus: "renting" });
      }
      closeGpsModal();
      setShowGpsIdModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send car");
    } finally {
      setProcessingReqId(null);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("GPS ID copied to clipboard!");
  };

  const handleCompleteRental = async (reqId: number) => {
    if (!confirm("Are you sure you want to complete this rental? The car will be marked as available.")) {
      return;
    }

    try {
      setProcessingReqId(reqId);

      const response = await fetch(`${BaseURL}/api/rent/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reqId: reqId,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string; message?: string };
        throw new Error(data.error || data.message || "Failed to complete rental");
      }

      const result = await response.json() as { message: string };
      alert(result.message);

      // Refresh the list to reflect changes
      await fetchApprovedRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete rental");
    } finally {
      setProcessingReqId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Approved Rental Requests
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Send your vehicles with GPS tracking for approved rentals
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No approved requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any approved rental requests at the moment.
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
                            alt={`${request.brand.toUpperCase()} ${request.model.toUpperCase()}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Request Details */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {request.brand.toUpperCase()} {request.model.toUpperCase()  }
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {request.year}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Approved
                              </span>
                              {request.carStatus === "renting" && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  Renting
                                </span>
                              )}
                            </div>
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
                              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
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

                          {/* GPS ID Display */}
                          {request.gpsId && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                GPS Tracking ID:
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded text-lg font-mono font-bold text-gray-900 dark:text-white">
                                  {request.gpsId}
                                </code>
                                <Button
                                  onClick={() => copyToClipboard(request.gpsId!)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                  📋 Copy
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Message */}
                          {request.reqMessage && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-600">
                              <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
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
                                Approved On
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
                            {!request.gpsId ? (
                              <Button
                                onClick={() => openGpsModal(request.reqId)}
                                disabled={processingReqId === request.reqId}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingReqId === request.reqId ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                  </span>
                                ) : (
                                  "🚗 Send Car with GPS"
                                )}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={() => {
                                    setGeneratedGpsId(request.gpsId!);
                                    setSelectedGpsRequest(request);
                                    setShowGpsIdModal(true);
                                  }}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide"
                                >
                                  📍 View GPS Details
                                </Button>
                                {request.status !== "completed" && (
                                  <Button
                                    onClick={() => window.location.href = `/host/track/${request.gpsId}`}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide"
                                  >
                                    🗺️ Track Vehicle
                                  </Button>
                                )}
                                {request.carStatus === "renting" && (
                                  <Button
                                    onClick={() => handleCompleteRental(request.reqId)}
                                    disabled={processingReqId === request.reqId}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {processingReqId === request.reqId ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Completing...
                                      </span>
                                    ) : (
                                      "✅ Complete Rental"
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
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

      {/* GPS Password Modal */}
      <AnimatePresence>
        {showGpsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeGpsModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🔐 Set GPS Password
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create a secure password for GPS tracking. This password will be shared
                with the renter to access vehicle location.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    GPS Password (8-20 characters)
                  </label>
                  <input
                    type="password"
                    value={gpsPassword}
                    onChange={(e) => {
                      setGpsPassword(e.target.value);
                      if (gpsPasswordError) setGpsPasswordError("");
                    }}
                    placeholder="Enter secure GPS password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {gpsPasswordError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {gpsPasswordError}
                    </p>
                  )}
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-3 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Share this password securely with the renter.
                    They will need it to track the vehicle.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={closeGpsModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCar}
                  disabled={processingReqId !== null || !gpsPassword}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingReqId !== null ? "Sending..." : "Send Car"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GPS ID Display Modal */}
      <AnimatePresence>
        {showGpsIdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeGpsIdModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  GPS Tracking Enabled!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your vehicle is now ready for tracking. Share this GPS ID with the
                  renter:
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 mb-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    GPS Tracking ID
                  </p>
                  <code className="block px-4 py-3 bg-white dark:bg-gray-800 rounded-lg text-2xl font-mono font-bold text-gray-900 dark:text-white mb-3">
                    {generatedGpsId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(generatedGpsId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    📋 Copy GPS ID
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded mb-6 text-left">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Important:</strong> The renter will need the GPS ID and the
                    password you set to track the vehicle in real-time.
                  </p>
                </div>
                <div className="flex gap-3">
                  {selectedGpsRequest?.status !== "completed" && (
                    <Button
                      onClick={() => window.location.href = `/host/track/${generatedGpsId}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      🗺️ Track Vehicle
                    </Button>
                  )}
                  <Button
                    onClick={closeGpsIdModal}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

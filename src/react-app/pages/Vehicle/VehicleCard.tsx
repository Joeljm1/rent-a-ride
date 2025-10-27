import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import type { AvailableCars } from "../../../worker/types";
import BaseURL from "../../../../BaseURL.ts";
import { AuthContext } from "../../AuthContext";

interface VehicleCardProps {
  vehicle: AvailableCars;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate();
  const session = useContext(AuthContext);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >(vehicle.pics.reduce((acc, pic) => ({ ...acc, [pic.id]: true }), {}));
  const [imageErrorStates, setImageErrorStates] = useState<
    Record<number, boolean>
  >({});

  // Rental Modal States
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalError, setRentalError] = useState<string | null>(null);
  const [rentalSuccess, setRentalSuccess] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");

  const handleImageLoad = (picId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [picId]: false }));
  };

  const handleImageError = (picId: number) => {
    setImageErrorStates((prev) => ({ ...prev, [picId]: true }));
    setImageLoadingStates((prev) => ({ ...prev, [picId]: false }));
  };

  const handleRent = () => {
    if (!session?.data?.session) {
      navigate("/login");
      return;
    }
    setShowRentalModal(true);
    setRentalError(null);
    setRentalSuccess(false);
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFromDate(tomorrow.toISOString().split("T")[0]);
  };

  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = to.getTime() - from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * (vehicle?.pricePerDay || 0);
  };

  const handleSubmitRental = async () => {
    if (!vehicle || !fromDate || !toDate) {
      setRentalError("Please fill in all required fields");
      return;
    }

    if (new Date(toDate) <= new Date(fromDate)) {
      setRentalError("End date must be after start date");
      return;
    }

    try {
      setRentalLoading(true);
      setRentalError(null);

      const response = await fetch(`${BaseURL}/api/rent/rent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          carId: vehicle.id,
          from: new Date(fromDate).toISOString(),
          to: new Date(toDate).toISOString(),
          msg: message || "No additional message",
        }),
      });

      const data = await response.json() as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Failed to create rental request");
      }

      setRentalSuccess(true);
      setTimeout(() => {
        setShowRentalModal(false);
        navigate("/host/bookings");
      }, 2000);
    } catch (err) {
      setRentalError(err instanceof Error ? err.message : "Failed to create rental request");
    } finally {
      setRentalLoading(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {vehicle.pics && vehicle.pics.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {vehicle.pics.map((pic) => {
                  const imageUrl =
                    BaseURL == "https://car-rental.joeltest.workers.dev"
                      ? `https://pub-032f94942a2e444fa6cc5af38ce60e9e.r2.dev/${pic.url}`
                      : "../assets/hono.svg";
                  return (
                    <CarouselItem key={pic.id} className="h-full">
                      <div className="relative w-full h-full">
                        {!imageErrorStates[pic.id] ? (
                          <img
                            src={imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                              imageLoadingStates[pic.id]
                                ? "opacity-0"
                                : "opacity-100"
                            }`}
                            onLoad={() => handleImageLoad(pic.id)}
                            onError={() => handleImageError(pic.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <div className="text-center">
                              <div className="text-4xl mb-2"><i className="fi fi-sr-car-alt"></i></div>
                              <p className="text-sm">Image unavailable</p>
                            </div>
                          </div>
                        )}
                        {imageLoadingStates[pic.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {vehicle.pics.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-none shadow-md" />
                  <CarouselNext className="right-2 bg-white/80 hover:bg-white border-none shadow-md" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-2"><i className="fi fi-sr-car-alt"></i></div>
                <p className="text-sm">No images available</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
              {vehicle.year}
            </span>
          </div>
          {vehicle.pics && vehicle.pics.length > 1 && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                {vehicle.pics.length} photos
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 line-clamp-1">
          {vehicle.brand.toUpperCase()} {vehicle.model.toUpperCase()}
        </CardTitle>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="mt-1"><i className="fi fi-ss-gas-pump-alt"></i></span>
              {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <span className="mt-1"><i className="fi fi-ss-settings"></i></span>
              {vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="mt-1"><i className="fi fi-sr-users-alt"></i></span>
              {vehicle.seats} Seats
            </span>
            <span className="flex items-center gap-1">
              <span className="mt-1"><i className="fi fi-sr-engine"></i></span>
              {vehicle.distanceUsed.toLocaleString()} km
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <button
          onClick={handleRent}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Rent Now
        </button>
        <button
          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Details
        </button>
      </CardFooter>
    </Card>

    {/* Rental Modal */}
    {showRentalModal && vehicle && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => !rentalLoading && setShowRentalModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Request to Rent
              </h2>
              <button
                onClick={() => setShowRentalModal(false)}
                disabled={rentalLoading}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Vehicle Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {vehicle?.pics && vehicle.pics[0] && (
                <img
                  src={BaseURL === "https://car-rental.joeltest.workers.dev"
                    ? `https://pub-032f94942a2e444fa6cc5af38ce60e9e.r2.dev/${vehicle.pics[0].url}`
                    : "../assets/hono.svg"}
                  alt={`${vehicle.brand.toUpperCase()} ${vehicle.model.toUpperCase()}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {vehicle?.brand.toUpperCase()} {vehicle?.model.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ₹{vehicle?.pricePerDay?.toLocaleString() || "0"}/day
                </p>
              </div>
            </div>

            {rentalSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Request Sent Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The car owner will review your request. Redirecting to your bookings...
                </p>
              </motion.div>
            ) : (
              <>
                {/* Date Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      From Date *
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      To Date *
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate || new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Price Calculation */}
                {fromDate && toDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{calculateTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Any special requests or questions for the owner..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error Message */}
                {rentalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    {rentalError}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRentalModal(false)}
                    disabled={rentalLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRental}
                    disabled={rentalLoading || !fromDate || !toDate}
                    className="flex-1 text-gray-100 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {rentalLoading ? "Processing..." : "Send Request"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </>
  );
}

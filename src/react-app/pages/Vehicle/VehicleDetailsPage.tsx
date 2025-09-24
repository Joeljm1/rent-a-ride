import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import type { AvailableCars } from "../../../worker/types";
import BaseURL from "../../../../BaseURL";

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<AvailableCars | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >({});
  const [imageErrorStates, setImageErrorStates] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cars/vehicle/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vehicle details");
        }
        const vehicleData: AvailableCars = await response.json();
        setVehicle(vehicleData);
        
        const initialLoadingStates = vehicleData.pics?.reduce(
          (acc, pic) => ({ ...acc, [pic.id]: true }),
          {}
        ) || {};
        setImageLoadingStates(initialLoadingStates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleImageLoad = (picId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [picId]: false }));
  };

  const handleImageError = (picId: number) => {
    setImageErrorStates((prev) => ({ ...prev, [picId]: true }));
    setImageLoadingStates((prev) => ({ ...prev, [picId]: false }));
  };

  const handleRent = () => {
    console.log(`Renting vehicle ${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || "Vehicle not found"}</p>
          <Button onClick={() => navigate("/vehicles")}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate("/vehicles")}
        className="mb-6"
      >
        ← Back to Vehicles
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
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
                                  className={`w-full h-full object-cover transition-all duration-300 ${
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
                                    <div className="text-6xl mb-4">🚗</div>
                                    <p className="text-lg">Image unavailable</p>
                                  </div>
                                </div>
                              )}
                              {imageLoadingStates[pic.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    {vehicle.pics.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
                        <CarouselNext className="right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🚗</div>
                      <p className="text-lg">No images available</p>
                    </div>
                  </div>
                )}
                {vehicle.pics && vehicle.pics.length > 1 && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm">
                      {vehicle.pics.length} photos
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {vehicle.year}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">⛽</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-semibold">{vehicle.fuelType}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-semibold">{vehicle.transmission}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Seating</p>
                    <p className="font-semibold">{vehicle.seats} seats</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">📏</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-semibold">{vehicle.distanceUsed.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Vehicle Features</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>🔧</span>
                      Well Maintained
                    </span>
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>🛡️</span>
                      Insurance Included
                    </span>
                    <Badge variant="secondary">Covered</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="flex items-center gap-2">
                      <span>📱</span>
                      24/7 Support
                    </span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                onClick={handleRent}
                className="flex-1"
                size="lg"
              >
                Rent This Vehicle
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => console.log("Contact seller")}
              >
                Contact
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
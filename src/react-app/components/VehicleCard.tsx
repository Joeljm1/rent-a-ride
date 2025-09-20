import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import type { AvailableCars } from "../../worker/types";

interface VehicleCardProps {
  vehicle: AvailableCars;
  onRent?: (vehicleId: number) => void;
}

export function VehicleCard({ vehicle, onRent }: VehicleCardProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>(
    vehicle.pics.reduce((acc, pic) => ({ ...acc, [pic.id]: true }), {})
  );
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({});

  const handleImageLoad = (picId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [picId]: false }));
  };

  const handleImageError = (picId: number) => {
    setImageErrorStates(prev => ({ ...prev, [picId]: true }));
    setImageLoadingStates(prev => ({ ...prev, [picId]: false }));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {vehicle.pics && vehicle.pics.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {vehicle.pics.map((pic) => {
                  const imageUrl = `https://pub-032f94942a2e444fa6cc5af38ce60e9e.r2.dev/${pic.url}`;
                  return (
                    <CarouselItem key={pic.id} className="h-full">
                      <div className="relative w-full h-full">
                        {!imageErrorStates[pic.id] ? (
                          <img
                            src={imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                              imageLoadingStates[pic.id] ? 'opacity-0' : 'opacity-100'
                            }`}
                            onLoad={() => handleImageLoad(pic.id)}
                            onError={() => handleImageError(pic.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🚗</div>
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
                <div className="text-4xl mb-2">🚗</div>
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
          {vehicle.brand} {vehicle.model}
        </CardTitle>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>⛽</span>
              {vehicle.fuelType}
            </span>
            <span className="flex items-center gap-1">
              <span>⚙️</span>
              {vehicle.transmission}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>👥</span>
              {vehicle.seats} seats
            </span>
            <span className="flex items-center gap-1">
              <span>📏</span>
              {vehicle.distanceUsed.toLocaleString()} km
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <button 
          onClick={() => onRent?.(vehicle.id)}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Rent Now
        </button>
        <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          Details
        </button>
      </CardFooter>
    </Card>
  );
}
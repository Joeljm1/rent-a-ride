import { VehicleCard } from "./VehicleCard";
import { Button } from "../../components/ui/button";
import type { AvailableCars } from "../../../worker/types";

interface VehicleGridProps {
  vehicles: AvailableCars[];
  loading?: boolean;
  onRent?: (vehicleId: number) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function VehicleGrid({ 
  vehicles, 
  loading = false, 
  onRent,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: VehicleGridProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">🚗</div>
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't find any vehicles matching your criteria. Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onRent={onRent}
          />
        ))}
      </div>
      
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {currentPage > 3 && totalPages > 5 && (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
              {currentPage > 4 && <span className="px-2">...</span>}
            </>
          )}
          
          {renderPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          
          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2">...</span>}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function VehicleCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-14" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <div className="flex-1 h-9 bg-muted rounded-lg" />
        <div className="w-20 h-9 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
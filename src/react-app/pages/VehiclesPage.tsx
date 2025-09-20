import { useState, useMemo } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { VehicleGrid } from "../components/VehicleGrid";
import { VehicleFilters, type FilterState } from "../components/VehicleFilters";
import type { CarList, AvailableCars } from "../../worker/types";

export default function VehiclesPage() {
  //in ok range only this is sent
  const cars = useLoaderData() as CarList;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [filters, setFilters] = useState<FilterState>({
    brand: "",
    fuelType: "",
    transmission: "",
    minSeats: 1,
    sortBy: "newest",
    search: "",
  });

  const handleRent = (vehicleId: number) => {
    // TODO: Implement rent functionality
    console.log(`Renting vehicle ${vehicleId}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`/vehicles?${params.toString()}`);
  };

  const filteredAndSortedVehicles = useMemo(() => {
    const filtered = cars.data.filter((vehicle: AvailableCars) => {
      if (
        filters.brand &&
        vehicle.brand.toLowerCase() !== filters.brand.toLowerCase()
      )
        return false;
      if (
        filters.fuelType &&
        vehicle.fuelType.toLowerCase() !== filters.fuelType.toLowerCase()
      )
        return false;
      if (
        filters.transmission &&
        vehicle.transmission.toLowerCase() !==
          filters.transmission.toLowerCase()
      )
        return false;
      if (filters.minSeats && vehicle.seats < filters.minSeats) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesBrand = vehicle.brand.toLowerCase().includes(searchTerm);
        const matchesModel = vehicle.model.toLowerCase().includes(searchTerm);
        if (!matchesBrand && !matchesModel) return false;
      }
      return true;
    });

    filtered.sort((a: AvailableCars, b: AvailableCars) => {
      switch (filters.sortBy) {
        case "newest":
          return b.year - a.year;
        case "oldest":
          return a.year - b.year;
        case "lowMileage":
          return a.distanceUsed - b.distanceUsed;
        case "highMileage":
          return b.distanceUsed - a.distanceUsed;
        default:
          return 0;
      }
    });

    return filtered;
  }, [cars.data, filters]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Vehicles</h1>
        <p className="text-muted-foreground">
          Choose from our wide selection of {cars.data.length} vehicles
        </p>
      </div>

      <VehicleFilters filters={filters} setFilters={setFilters} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedVehicles.length} of {cars.data.length}{" "}
          vehicles
        </p>
        {cars.metaData && (
          <p className="text-sm text-muted-foreground">
            Page {cars.metaData.page} of {cars.metaData.totalPage}
          </p>
        )}
      </div>

      <VehicleGrid
        vehicles={filteredAndSortedVehicles}
        onRent={handleRent}
        currentPage={currentPage}
        totalPages={cars.metaData?.totalPage || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

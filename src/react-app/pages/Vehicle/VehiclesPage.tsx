import { useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { VehicleGrid } from "../Vehicle/VehicleGrid";
import { VehicleFilters, type FilterState } from "../Vehicle/VehicleFilters";
import type { CarList } from "../../../worker/types";

export default function VehiclesPage() {
  const cars = useLoaderData() as CarList;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    brand: searchParams.get("brand") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    minSeats: parseInt(searchParams.get("minSeats") || "1"),
    sortBy: (searchParams.get("sortBy") as FilterState["sortBy"]) || "newest",
    search: searchParams.get("search") || "",
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

  // Update URL and reload data when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to first page when filters change

    if (newFilters.brand) params.set("brand", newFilters.brand);
    if (newFilters.fuelType) params.set("fuelType", newFilters.fuelType);
    if (newFilters.transmission)
      params.set("transmission", newFilters.transmission);
    if (newFilters.minSeats > 1)
      params.set("minSeats", newFilters.minSeats.toString());
    if (newFilters.sortBy !== "newest") params.set("sortBy", newFilters.sortBy);
    if (newFilters.search) params.set("search", newFilters.search);

    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Vehicles</h1>
        <p className="text-muted-foreground">
          Choose from our wide selection of vehicles
        </p>
      </div>

      <VehicleFilters filters={filters} setFilters={handleFiltersChange} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {cars.data.length} vehicles
        </p>
        {cars.metaData && (
          <p className="text-sm text-muted-foreground">
            Page {cars.metaData.page} of {cars.metaData.totalPage}
          </p>
        )}
      </div>

      <VehicleGrid
        vehicles={cars.data}
        onRent={handleRent}
        currentPage={currentPage}
        totalPages={cars.metaData?.totalPage || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

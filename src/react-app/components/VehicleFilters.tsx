import { useState, useEffect } from "react";

interface VehicleFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export interface FilterState {
  brand: string;
  fuelType: string;
  transmission: string;
  minSeats: number;
  maxPrice?: number;
  sortBy: "newest" | "oldest" | "lowMileage" | "highMileage";
  search: string;
}

export function VehicleFilters({ filters, setFilters }: VehicleFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded filter options
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
  const transmissions = ["Manual", "Automatic"];

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/cars/brands");
        const brandsData = await response.json();
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number,
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      brand: "",
      fuelType: "",
      transmission: "",
      minSeats: 1,
      sortBy: "newest",
      search: "",
    };
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.brand ||
    filters.fuelType ||
    filters.transmission ||
    filters.minSeats > 1 ||
    filters.search;

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🔍</span>
          Filter Vehicles
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Active
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors"
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 ${!isExpanded ? "hidden lg:grid" : ""}`}
      >
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort by</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="lowMileage">Low mileage</option>
            <option value="highMileage">High mileage</option>
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={loading}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Fuel Type</label>
          <select
            value={filters.fuelType}
            onChange={(e) => handleFilterChange("fuelType", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">All types</option>
            {fuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType}>
                {fuelType}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium mb-1">Transmission</label>
          <select
            value={filters.transmission}
            onChange={(e) => handleFilterChange("transmission", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">All types</option>
            {transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Seats */}
        <div>
          <label className="block text-sm font-medium mb-1">Min. Seats</label>
          <select
            value={filters.minSeats}
            onChange={(e) =>
              handleFilterChange("minSeats", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value={1}>Any</option>
            <option value={2}>2+</option>
            <option value={4}>4+</option>
            <option value={5}>5+</option>
            <option value={7}>7+</option>
          </select>
        </div>

        {/* Search */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Model, brand..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

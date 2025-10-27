import { useState } from "react";
import { useNavigate } from "react-router";
import FileUpload from "./FileUpload";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import FormTextarea from "./FormTextarea";
import Button from "./Button";

type FileSend = {
  file: File;
  isCover: boolean;
};

export interface FileWithProgress extends FileSend {
  id: string;
  progress: number;
  uploaded: boolean;
}

interface CarFormData {
  brand: string;
  model: string;
  distance: string;
  year: string;
  seats: string;
  description: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  pricePerDay: string;
  gps: boolean;
}

export default function FileUploader() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [formData, setFormData] = useState<CarFormData>({
    brand: "",
    model: "",
    distance: "",
    year: "",
    seats: "",
    description: "",
    fuelType: "petrol",
    transmission: "manual",
    mileage: "10",
    pricePerDay: "",
    gps: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleInputChange = (field: keyof CarFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.distance.trim()) newErrors.distance = "Distance is required";
    if (!formData.year.trim()) newErrors.year = "Year is required";
    if (isNaN(parseInt(formData.year.trim()))) {
      newErrors.year = "Year should be a number";
    }
    if (!formData.seats.trim()) newErrors.seats = "Seats is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.pricePerDay.trim()) {
      newErrors.pricePerDay = "Price per day is required";
    } else if (
      isNaN(parseInt(formData.pricePerDay.trim())) ||
      parseInt(formData.pricePerDay.trim()) <= 0
    ) {
      newErrors.pricePerDay = "Price must be a positive number";
    }

    if (files.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      files.forEach((fileWithProgress, index) => {
        submitData.append(`file_${index}`, fileWithProgress.file);
        if (fileWithProgress.isCover) {
          submitData.append("Cover", `${index}`);
        }
      });
      const response = await fetch(`/api/cars/addCar`, {
        method: "POST",
        credentials: "include",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Failed to add car");
      }

      navigate("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to add car. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fuelTypeOptions = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "electric", label: "Electric" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const transmissionOptions = [
    { value: "manual", label: "Manual" },
    { value: "automatic", label: "Automatic" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🚗</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Car
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to list your vehicle for rent
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Vehicle Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl">📋</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Vehicle Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  error={errors.brand}
                  required
                />

                <FormInput
                  label="Model"
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  error={errors.model}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Distance (km)"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => handleInputChange("distance", e.target.value)}
                  error={errors.distance}
                  min="0"
                  required
                />

                <FormInput
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  error={errors.year}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Number of Seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => handleInputChange("seats", e.target.value)}
                  error={errors.seats}
                  min="1"
                  max="50"
                  required
                />

                <FormInput
                  label="Price Per Day (₹)"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange("pricePerDay", e.target.value)}
                  error={errors.pricePerDay}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl">⚙️</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Fuel Type"
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange("fuelType", e.target.value)}
                  options={fuelTypeOptions}
                  error={errors.fuelType}
                  required
                />

                <FormSelect
                  label="Transmission"
                  value={formData.transmission}
                  onChange={(e) => handleInputChange("transmission", e.target.value)}
                  options={transmissionOptions}
                  error={errors.transmission}
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <input
                  type="checkbox"
                  id="gps"
                  checked={formData.gps}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gps: e.target.checked }))
                  }
                  className="w-5 h-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                />
                <label
                  htmlFor="gps"
                  className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  <span className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>GPS Navigation System Available</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl">✍️</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
              </div>

              <FormTextarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                error={errors.description}
                rows={5}
                placeholder="Describe the car's condition, features, maintenance history, and any special notes..."
                required
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl">📸</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Images
                </h2>
              </div>

              <FileUpload files={files} setFiles={setFiles} />

              {errors.images && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {errors.images}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <span className="text-red-500 text-xl">❌</span>
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {errors.submit}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding Car...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2 cursor-pointer">
                    <span>Add Car to Listings</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Make sure all information is accurate before submitting
          </p>
        </div>
      </div>
    </div>
  );
}

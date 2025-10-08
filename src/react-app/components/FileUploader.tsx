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
    } else if (isNaN(parseInt(formData.pricePerDay.trim())) || parseInt(formData.pricePerDay.trim()) <= 0) {
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Car</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          error={errors.description}
          rows={4}
          placeholder="Describe the car's condition, features, etc."
          required
        />

        <FileUpload files={files} setFiles={setFiles} />

        {errors.images && (
          <div className="text-red-600 text-sm">{errors.images}</div>
        )}

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Add Car
        </Button>
      </form>
    </div>
  );
}

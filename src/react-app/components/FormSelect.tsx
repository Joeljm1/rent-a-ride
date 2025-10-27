import { SelectHTMLAttributes } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export default function FormSelect({ label, options, error, className = "", ...props }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        {...props}
        className={`px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white ${
          error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
        } ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
}
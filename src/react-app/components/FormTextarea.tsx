import { TextareaHTMLAttributes } from "react";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function FormTextarea({ label, error, className = "", ...props }: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        {...props}
        className={`px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg resize-vertical min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
          error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
        } ${className}`}
      />
      {error && <span className="text-sm text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
}
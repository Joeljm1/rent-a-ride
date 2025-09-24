import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex flex-col w-full items-center justify-center min-h-[60vh] text-center py-12">
      <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Page Not Found
      </h2>
      <p className="mb-6 text-gray-500 dark:text-gray-400">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/"
        className="inline-block px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold transition"
      >
        Go Home
      </Link>
    </div>
  );
}

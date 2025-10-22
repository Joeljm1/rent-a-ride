import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="w-full transition-colors duration-300 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Main Content Container */}
        <div className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-16 h-16 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="p-12 text-center space-y-6">
            <h1 className="text-8xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Oops! The page you're looking for seems to have taken a detour. It might have been moved or doesn't exist.
            </p>

            {/* Suggestions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mt-8">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-medium">
                Here are some helpful links instead:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link 
                  to="/"
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:scale-105 text-sm"
                >
                  🏠 Home
                </Link>
                <Link 
                  to="/vehicles"
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:scale-105 text-sm"
                >
                  🚗 Browse Vehicles
                </Link>
                <Link 
                  to="/contact"
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:scale-105 text-sm"
                >
                  📧 Contact Us
                </Link>
              </div>
            </div>

            {/* Primary CTA */}
            <Link 
              to="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg mt-6 text-lg"
            >
              Take Me Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

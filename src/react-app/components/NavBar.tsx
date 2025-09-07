import { Outlet } from "react-router";
import { Link } from "react-router";
import { AuthContext } from "../AuthContext";
import { useContext } from "react";
import { authClient } from "../../lib/auth-client";

export default function NavBar() {
  const session = useContext(AuthContext);

  return (
    <>
      <nav className="bg-blue-500 shadow-lg border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Rent-A-Ride
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/vehicles"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Vehicles
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/upload"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Upload
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {session?.data?.session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Welcome,{" "}
                    <span className="font-semibold">
                      {session.data.user.name}
                    </span>
                  </span>
                  <button
                    onClick={() => authClient.signOut()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      Log In
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button className="text-gray-700 hover:text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

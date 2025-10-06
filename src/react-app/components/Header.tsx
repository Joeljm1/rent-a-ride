import { Link, NavLink } from "react-router";
import { AuthContext } from "../AuthContext";
import { useContext, useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";
import imageUrl from "../assets/RentARideLogo.webp";

export default function Header() {
  const session = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore write errors
    }
  }, [isDarkMode]);

  const activeStyle: React.CSSProperties= {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#6f00ffff",
  };

  return (
    <header className="bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center">
          <img src={imageUrl} alt="RentARide Logo" className="h-8 mr-2" />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
            #RentARide
          </span>
        </Link>

        <nav className="flex space-x-6">
          <NavLink
            to="/host"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            Host
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            About
          </NavLink>
          <NavLink
            to="/vehicles"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            Cars
          </NavLink>
          <NavLink
            to="/upload"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            Upload
          </NavLink>
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
            <>
              <NavLink
                to="/login"
                style={({ isActive }) => (isActive ? activeStyle : undefined)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                style={({ isActive }) => (isActive ? activeStyle : undefined)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
              >
                Register
              </NavLink>
            </>
          )
        }
        </nav>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className="ml-4 rounded-full p-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
} 

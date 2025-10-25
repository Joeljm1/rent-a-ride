import { Link, NavLink } from "react-router";
import { AuthContext } from "../AuthContext";
import { useContext, useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";
import imageUrl from "../assets/RentARideLogo.webp";
import { motion, AnimatePresence } from "motion/react";

export default function Header() {
  const session = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
    } catch {
      // ignore
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
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
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore write errors
    }
  }, [isDarkMode]);

  const activeStyle: React.CSSProperties = {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#6f00ffff",
  };

  return (
    <header className="bg-white dark:bg-gray-900 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center">
          <img src={imageUrl} alt="RentARide Logo" className="h-8 mr-2" />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-300 tracking-tight">
            #RentARide
          </span>
        </Link>

        <nav className="flex space-x-6">
          <NavLink
            to="/host"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
          >
            Host
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
          >
            About
          </NavLink>
          <NavLink
            to="/vehicles"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
            prefetch="intent"
          >
            Cars
          </NavLink>
          <NavLink
            to="/ai-chat"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
          >
            AI Chat
          </NavLink>
          <NavLink
            to="/upload"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
          >
            Upload
          </NavLink>
          {session?.data?.session ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300 font-normal">
                Welcome,{" "}
                <span className="font-semibold">{session.data.user.name}</span>
              </span>
              <button
                onClick={() => authClient.signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-semibold tracking-wide"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                style={({ isActive }) => (isActive ? activeStyle : undefined)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                style={({ isActive }) => (isActive ? activeStyle : undefined)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tracking-wide"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
        {/* Dark Mode Toggle Switch with Animation */}
        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className={`ml-4 w-16 h-8 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-300 ${
            isDarkMode 
              ? "bg-blue-600 dark:bg-blue-500 justify-end" 
              : "bg-gray-300 dark:bg-gray-600 justify-start"
          }`}
          aria-label="Toggle dark mode"
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isDarkMode ? "moon" : "sun"}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                {isDarkMode ? "🌙" : "☀️"}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </button>
      </div>
    </header>
  );
}

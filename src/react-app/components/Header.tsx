import { Link, NavLink } from "react-router";
import { AuthContext } from "../AuthContext";
import { useContext, useState, useEffect, useRef } from "react";
import { authClient } from "../../lib/auth-client";
import imageUrl from "../assets/RentARideLogo.webp";
import { motion, AnimatePresence } from "motion/react";

export default function Header() {
  const session = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollToTopRef = useRef(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg"
          : "bg-white dark:bg-gray-900 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={scrollToTopRef.current}
            className="flex items-center gap-2 group"
          >
            <img
              src={imageUrl}
              alt="RentARide Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              #RentARide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/host"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              Host
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
              prefetch="intent"
            >
              Cars
            </NavLink>
            <NavLink
              to="/ai-chat"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              AI Chat
            </NavLink>
          </nav>

          {/* Right Section: User/Auth + Dark Mode */}
          <div className="hidden md:flex items-center gap-3">
            {session?.data?.session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {session.data.user.image && (
                    <img
                      src={session.data.user.image}
                      alt={session.data.user.name}
                      className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {session.data.user.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => authClient.signOut()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm shadow-lg"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200"
                >
                  Register
                </NavLink>
              </>
            )}

            {/* Dark Mode Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode((v) => !v)}
              className={`w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-300 ${
                isDarkMode
                  ? "bg-blue-600 justify-end"
                  : "bg-gray-300 justify-start"
              }`}
              aria-label="Toggle dark mode"
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
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
                    className="text-xs"
                  >
                    {isDarkMode ? "🌙" : "☀️"}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Dark Mode Toggle (Mobile) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode((v) => !v)}
              className={`w-12 h-6 rounded-full p-0.5 cursor-pointer flex items-center transition-colors duration-300 ${
                isDarkMode
                  ? "bg-blue-600 justify-end"
                  : "bg-gray-300 justify-start"
              }`}
              aria-label="Toggle dark mode"
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                layout
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <span className="text-xs">{isDarkMode ? "🌙" : "☀️"}</span>
              </motion.div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 mt-2"
            >
              <nav className="py-4 space-y-2">
                <NavLink
                  to="/host"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  Host
                </NavLink>
                <NavLink
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/vehicles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  Cars
                </NavLink>
                <NavLink
                  to="/ai-chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  AI Chat
                </NavLink>

                {session?.data?.session ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {session.data.user.image && (
                        <img
                          src={session.data.user.image}
                          alt={session.data.user.name}
                          className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {session.data.user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        authClient.signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm"
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

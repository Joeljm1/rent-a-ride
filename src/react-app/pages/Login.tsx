import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { useLocation } from "react-router";
import BaseURL from "../../../BaseURL";

interface LoginInfo {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "email": {
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return undefined;
      }
      case "password": {
        if (!value) return "Password is required";
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setLoginInfo({ ...loginInfo, [name]: value });

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: undefined });
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setValidationErrors({ ...validationErrors, [name]: error });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    errors.email = validateField("email", loginInfo.email);
    errors.password = validateField("password", loginInfo.password);

    setValidationErrors(errors);
    setTouched({ email: true, password: true });

    return !errors.email && !errors.password;
  };

  async function signIn(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Attempting to sign in with base URL:", authClient);

      const { data, error: authError } = await authClient.signIn.email(
        {
          email: loginInfo.email,
          password: loginInfo.password,
          callbackURL: BaseURL,
        },
        {
          onRequest: (ctx) => {
            console.log("Auth request:", ctx);
          },
          onSuccess: (ctx) => {
            console.log("Auth success:", ctx.data);
            setSuccess(true);
            setLoginInfo({ email: "", password: "" });
            setTimeout(() => {
              window.location.href = "/";
            }, 1500);
          },
          onError: (ctx) => {
            console.error("Auth error:", ctx.error);
            setError(ctx.error.message || "Authentication failed");
          },
        },
      );

      if (authError) {
        console.error("Sign in error:", authError);
        setError(authError.message || "Failed to sign in");
      } else {
        console.log("Sign in successful:", data);
      }
    } catch (err) {
      console.error("Network or other error:", err);
      setError(err instanceof Error ? err.message : "Network error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {location.state?.message ? (
          <div className="justify-center text-red-500 dark:text-red-400">
            {location.state.message}
          </div>
        ) : (
          ""
        )}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-lg p-8 border dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-normal tracking-wide">Sign in to your car rental account</p>
          </div>

          <form className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-red-500 dark:text-red-300 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-green-500 dark:text-green-300 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Sign in successful! Redirecting you to the dashboard...
                </span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-400 ${
                  validationErrors.email && touched.email
                    ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/30"
                    : loginInfo.email && !validationErrors.email
                      ? "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/30"
                      : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter your email address"
                value={loginInfo.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                disabled={isLoading}
                required
              />
              {validationErrors.email && touched.email && (
                <div className="flex items-center space-x-2 mt-2 text-red-600 dark:text-red-300">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{validationErrors.email}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-400 ${
                  validationErrors.password && touched.password
                    ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/30"
                    : loginInfo.password && !validationErrors.password
                      ? "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/30"
                      : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter your password"
                value={loginInfo.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
                disabled={isLoading}
                required
              />
              {validationErrors.password && touched.password && (
                <div className="flex items-center space-x-2 mt-2 text-red-600 dark:text-red-300">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{validationErrors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 tracking-wide ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              }`}
              onClick={signIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-normal">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold tracking-wide"
              >
                Create one
              </a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-normal">
              <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold tracking-wide"
              >
                Forgot your password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

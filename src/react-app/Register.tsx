import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import BaseURL from "./BaseURL";
import "./Register.css";

interface userInfo {
  name: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function Register() {
  useEffect(() => {}, []);
  const [usrInfo, setusrInfo] = useState<userInfo>({
    name: "",
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

  // Validation functions
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return undefined;
      case "email":
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return undefined;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setusrInfo({ ...usrInfo, [name]: value });

    // Clear validation error when user starts typing
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
    errors.name = validateField("name", usrInfo.name);
    errors.email = validateField("email", usrInfo.email);
    errors.password = validateField("password", usrInfo.password);

    setValidationErrors(errors);
    setTouched({ name: true, email: true, password: true });

    return !errors.name && !errors.email && !errors.password;
  };

  async function signUp(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Attempting to sign up with base URL:", authClient);

      const { data, error: authError } = await authClient.signUp.email(
        {
          email: usrInfo.email,
          password: usrInfo.password,
          name: usrInfo.name,
          // callbackURL: "https://car-rental.joeltest.workers.dev",
          callbackURL: BaseURL,
        },
        {
          onRequest: (ctx) => {
            console.log("Auth request:", ctx);
          },
          onSuccess: (ctx) => {
            console.log("Auth success:", ctx.data);
            setSuccess(true);
            setusrInfo({ name: "", email: "", password: "" });
          },
          onError: (ctx) => {
            console.error("Auth error:", ctx.error);
            setError(ctx.error.message || "Authentication failed");
          },
        },
      );

      if (authError) {
        console.error("Sign up error:", authError);
        setError(authError.message || "Failed to sign up");
      } else {
        console.log("Sign up successful:", data);
        // authClient.sendVerificationEmail()
      }
    } catch (err) {
      console.error("Network or other error:", err);
      setError(err instanceof Error ? err.message : "Network error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our car rental platform today</p>
        </div>

        <form className="register-form">
          {error && (
            <div className="alert alert-error">
              <svg
                className="alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg
                className="alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Registration successful! Please check your email for
                verification.
              </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${validationErrors.name && touched.name ? "error" : ""} ${usrInfo.name && !validationErrors.name ? "success" : ""}`}
              placeholder="Enter your full name"
              value={usrInfo.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={(e) => handleFieldBlur("name", e.target.value)}
              disabled={isLoading}
              required
            />
            {validationErrors.name && touched.name && (
              <div className="field-error">
                <svg
                  className="error-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{validationErrors.name}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${validationErrors.email && touched.email ? "error" : ""} ${usrInfo.email && !validationErrors.email ? "success" : ""}`}
              placeholder="Enter your email address"
              value={usrInfo.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={(e) => handleFieldBlur("email", e.target.value)}
              disabled={isLoading}
              required
            />
            {validationErrors.email && touched.email && (
              <div className="field-error">
                <svg
                  className="error-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{validationErrors.email}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${validationErrors.password && touched.password ? "error" : ""} ${usrInfo.password && !validationErrors.password ? "success" : ""}`}
              placeholder="Create a secure password"
              value={usrInfo.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              onBlur={(e) => handleFieldBlur("password", e.target.value)}
              disabled={isLoading}
              required
            />
            {validationErrors.password && touched.password && (
              <div className="field-error">
                <svg
                  className="error-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{validationErrors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""}`}
            onClick={signUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <a href="/login" className="link">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

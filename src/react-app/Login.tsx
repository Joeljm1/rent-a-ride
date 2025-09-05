import { useState, useContext } from "react";
import { authClient } from "../lib/auth-client";
import { redirect } from "react-router";
import { AuthContext } from "./AuthContext";
import "./Register.css"; // Reusing the same CSS styles

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
  const Session = useContext(AuthContext);
  if (Session !== null) {
    console.log("Logged in");
    redirect("/");
  }
  // Validation functions
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
    errors.email = validateField("email", loginInfo.email);
    errors.password = validateField("password", loginInfo.password);

    setValidationErrors(errors);
    setTouched({ email: true, password: true });

    return !errors.email && !errors.password;
  };

  async function signIn(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    // Validate form before submission
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
          // callbackURL: "https://car-rental.joeltest.workers.dev/",
          callbackURL: "http://localhost:5173/",
        },
        {
          onRequest: (ctx) => {
            console.log("Auth request:", ctx);
          },
          onSuccess: (ctx) => {
            console.log("Auth success:", ctx.data);
            setSuccess(true);
            setLoginInfo({ email: "", password: "" });
            // Redirect to dashboard or home page after successful login
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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your car rental account</p>
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
                Sign in successful! Redirecting you to the dashboard...
              </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${validationErrors.email && touched.email ? "error" : ""} ${loginInfo.email && !validationErrors.email ? "success" : ""}`}
              placeholder="Enter your email address"
              value={loginInfo.email}
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
              className={`form-input ${validationErrors.password && touched.password ? "error" : ""} ${loginInfo.password && !validationErrors.password ? "success" : ""}`}
              placeholder="Enter your password"
              value={loginInfo.password}
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
            onClick={signIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="link">
              Create one
            </a>
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href="/forgot-password" className="link">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

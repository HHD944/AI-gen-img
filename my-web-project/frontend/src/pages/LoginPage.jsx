import { MessageSquare } from "lucide-react";
import { useState } from "react";
import ErrorBoundary from "./ErrorBoundery";
import { useAuthStore } from "../store/userAuthStore";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
const LoginPage = () => {
  const [showpassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLogingIn } = useAuthStore();
  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password.trim()) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    return true;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      login(formData);
    }
  };
  return (
    <ErrorBoundary>
      <div className="min-h-screen grid ">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                  <MessageSquare className="size-6 text-info" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Welcome back!</h1>
                <p className="text-base-content/60">
                  Glad to see you again. Please log in to your account.
                </p>
              </div>
            </div>
            {/* FORM */}
            {/* // ...existing code... */}
            <form
              className="space-y-3 bg-base-100 p-6 rounded-2xl shadow-xl"
              onSubmit={handleSubmit}
            >
              {/* <div className="form-control flex flex-row items-center gap-3">
                <label htmlFor="fullName" className="label w-32 p-0">
                  <span className="label-text text-base font-medium">
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="input border border-transparent hover:border-info input-info flex-1 min-w-0"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div> */}
              <div className="form-control flex flex-row items-center gap-3">
                <label htmlFor="email" className="label w-32 p-0">
                  <span className="label-text text-base font-medium">
                    Email
                  </span>
                </label>
                <div className="relative flex-1 min-w-0">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="input border border-transparent hover:border-info input-info w-full pr-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="form-control flex flex-row items-center gap-3">
                <label htmlFor="password" className="label w-32 p-0">
                  <span className="label-text text-base font-medium">
                    Password
                  </span>
                </label>
                <div className="relative flex-1 min-w-0">
                  <input
                    type={showpassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="input border border-transparent hover:border-info input-info w-full pr-12"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showpassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m1.414-1.414A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* <div className="form-control flex flex-row items-center gap-3">
                <label htmlFor="confirmPassword" className="label w-32 p-0">
                  <span className="label-text text-base font-medium">
                    Confirm Password
                  </span>
                </label>
                <input
                  type={showpassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="input border border-transparent hover:border-info input-info flex-1 min-w-0"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div> */}
              <button
                type="submit"
                className={`btn btn-info w-full mt-2 ${
                  isLogingIn ? "loading" : ""
                }`}
                disabled={isLogingIn}
              >
                Log In
              </button>
              <Link to="/signup" className="text-blue-500 hover:underline">
                Have no account? Sign up here.
              </Link>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default LoginPage;

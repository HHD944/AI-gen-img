import React from "react";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingPage from "./pages/SettingPage";
import ImageGenerator from "./pages/ImageGenerator";
import ProfilePage from "./pages/ProfilePage";
import Forum from "./pages/Forum";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/userAuthStore.js";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImageGenProvider } from "./context/ImageGenContext"; // Import Provider vừa tạo
const App = () => {
  const { authUser, checkAuth, isCheckingAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
    document.documentElement.setAttribute("data-theme", "light");
  }, [checkAuth]);
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    if (!authUser) {
      console.log("Logout successfully");
    }
  };
  console.log("Auth User: ", authUser);
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "",
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <div className="relative z-50">{authUser && <Navbar />}</div>
      <ImageGenProvider>
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route path="/setting" element={<SettingPage />} />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/imagegenerator"
            element={authUser ? <ImageGenerator /> : <Navigate to="/login" />}
          />
          <Route
            path="/forum"
            element={authUser ? <Forum /> : <Navigate to="/login" />}
          />
        </Routes>
      </ImageGenProvider>
    </div>
  );
};

export default App;

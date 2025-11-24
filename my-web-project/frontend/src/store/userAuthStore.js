import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { TableRowsSplit } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = "http://localhost:5001";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdateProfile: false,
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:5001/api/auth/check"
      );

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post(
        "http://localhost:5001/api/auth/signup",
        data
      );
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error("Error in signup: ", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("http://localhost:5001/api/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      console.log("Logged out successfully");
    } catch (error) {
      console.log("Error in logout: ", error);
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post(
        "http://localhost:5001/api/auth/login",
        data
      );
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdateProfile: true });
    try {
      const res = await axiosInstance.put(
        "http://localhost:5001/api/auth/update-profile",
        data
      );
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile: ", error);
      toast.error("Error in updating profile");
    } finally {
      set({ isUpdateProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL);
    socket.connect();
    set({ socket: socket });
  },
  disconnectSocket: () => {
    console.log("Disconnecting socket...");
    if (get().socket?.connected) get().socket.disconnect();
  },
}));

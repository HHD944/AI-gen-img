import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001"; // Nên dùng biến môi trường nếu có

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdateProfile: false,
  isCheckingAuth: true,
  socket: null,

  // 1. QUAN TRỌNG: Phải khai báo biến này để Sidebar không bị lỗi
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check"); // Đã dùng axiosInstance thì không cần http://localhost...
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
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error in signup");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout: ", error);
      toast.error(error.response?.data?.message || "Error logging out");
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error logging in";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdateProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile: ", error);
      toast.error("Error in updating profile");
    } finally {
      set({ isUpdateProfile: false });
    }
  },

  // 2. CẬP NHẬT LOGIC SOCKET
  connectSocket: () => {
    const { authUser } = get();
    // Nếu chưa đăng nhập hoặc socket đã kết nối rồi thì không làm gì cả
    if (!authUser || get().socket?.connected) return;

    // Gửi userId lên server để server biết ai đang connect
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();

    // Lưu socket vào state
    set({ socket: socket });

    // Lắng nghe sự kiện từ Server trả về danh sách người online
    // (Đảm bảo backend của bạn emit sự kiện tên là "getOnlineUsers")
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    console.log("Disconnecting socket...");
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null }); // Reset socket về null
  },
}));

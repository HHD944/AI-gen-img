import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePostStore = create((set, get) => ({
  posts: [],
  isPostsLoading: false,
  isCreatingPost: false,

  // Lấy tất cả bài viết
  getPosts: async () => {
    set({ isPostsLoading: true });
    try {
      const res = await axiosInstance.get("/posts/all");
      set({ posts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải bài viết");
    } finally {
      set({ isPostsLoading: false });
    }
  },

  // Tạo bài viết mới
  createPost: async (data) => {
    set({ isCreatingPost: true });
    try {
      const res = await axiosInstance.post("/posts/create", data);
      // Thêm bài viết mới vào đầu danh sách hiện tại
      set({ posts: [res.data, ...get().posts] });
      toast.success("Đã đăng bài viết!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đăng bài");
    } finally {
      set({ isCreatingPost: false });
    }
  },

  // Like/Unlike bài viết
  likePost: async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/like/${postId}`);
      // res.data trả về mảng likes mới từ backend
      set({
        posts: get().posts.map((post) =>
          post._id === postId ? { ...post, likes: res.data } : post
        ),
      });
    } catch (error) {
      console.error("Lỗi khi like:", error);
    }
  },
}));

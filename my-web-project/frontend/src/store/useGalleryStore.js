import { create } from "zustand";

export const useGalleryStore = create((set) => ({
  images: [], // Danh sách ảnh { id, url, prompt, createdAt }
  isFetching: false,
  setImages: (images) => set({ images }),
  // Thêm logic fetch ảnh từ API của bạn ở đây
}));

// frontend/src/context/ImageGenContext.jsx

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io as ioClient } from "socket.io-client";
import toast from "react-hot-toast"; // Dùng thư viện toast bạn đã có trong App.jsx
import { axiosInstance } from "../lib/axios.js"; // Import axios instance của bạn (kiểm tra lại đường dẫn import đúng file axios.js)
import { useGalleryStore } from "../store/useGalleryStore";

const ImageGenContext = createContext();

export const useImageGen = () => useContext(ImageGenContext);

export const ImageGenProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestResult, setLatestResult] = useState(null); // Lưu kết quả ảnh mới nhất
  const socketRef = useRef(null);

  // Lấy hàm update store từ zustand
  const addPendingImage = useGalleryStore((s) => s.addPendingImage);

  // 1. Khởi tạo Socket Global (Chỉ chạy 1 lần khi App mở)
  useEffect(() => {
    // Kết nối socket
    socketRef.current = ioClient("http://localhost:5001");

    socketRef.current.on("connect", () => {
      console.log("Global Socket connected:", socketRef.current.id);
    });

    // Lắng nghe sự kiện ảnh tạo xong
    socketRef.current.on("image_generated", (payload) => {
      console.log("Nhận được ảnh từ server:", payload);

      // Cập nhật State
      setIsGenerating(false);

      const imgData = {
        id: payload.jobId,
        imageUrl: payload.imageUrl,
        originalPrompt: payload.originalPrompt,
        refinedPrompt: payload.refinedPrompt,
        createdAt: payload.createdAt || Date.now(),
      };

      setLatestResult(imgData);

      // Cập nhật Gallery Store (Zustand)
      const imgForStore = {
        id: payload.jobId,
        url: payload.imageUrl,
        prompt: payload.originalPrompt,
        refinedPrompt: payload.refinedPrompt,
        createdAt: payload.createdAt || Date.now(),
      };
      addPendingImage(imgForStore);

      // Thông báo cho người dùng (quan trọng khi đang ở Tab Chat)
      toast.success("Ảnh AI của bạn đã tạo xong!", { duration: 4000 });
    });

    socketRef.current.on("image_generated_error", (err) => {
      console.error("Lỗi tạo ảnh:", err);
      setIsGenerating(false);
      toast.error("Tạo ảnh thất bại: " + (err.message || "Lỗi server"));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [addPendingImage]);

  // 2. Hàm gọi API tạo ảnh (Sẽ được gọi từ Component)
  const generateImage = async (prompt, selectedFile) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLatestResult(null); // Reset kết quả cũ

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      // Dùng axiosInstance thay vì fetch để đồng bộ project
      const resp = await axiosInstance.post("/image/create-job", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Job created:", resp.data.jobId);
      toast.loading("Đang gửi yêu cầu cho AI...", { duration: 2000 });

      // Không set isGenerating(false) ở đây, đợi socket trả về mới set false
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error(
        "Lỗi gửi yêu cầu: " + (error.response?.data?.error || error.message)
      );
      setIsGenerating(false);
    }
  };

  // Save latest generated image to backend gallery
  const saveLatestResult = async () => {
    if (!latestResult) return null;
    try {
      const payload = {
        imageData: latestResult.imageUrl,
        originalPrompt: latestResult.originalPrompt,
        refinedPrompt: latestResult.refinedPrompt,
      };
      const resp = await axiosInstance.post("/image/save", payload);
      const saved = resp.data.image;
      // add to gallery store as final saved image
      useGalleryStore.getState().addImage({
        id: saved._id,
        url: saved.url,
        prompt: latestResult.originalPrompt,
        refinedPrompt: latestResult.refinedPrompt,
        createdAt: saved.createdAt,
      });
      return saved;
    } catch (error) {
      console.error("Save latest error:", error);
      throw error;
    }
  };

  const clearLatestResult = () => {
    setLatestResult(null);
  };

  return (
    <ImageGenContext.Provider
      value={{
        isGenerating,
        latestResult,
        generateImage,
        saveLatestResult,
        clearLatestResult,
      }}
    >
      {children}
    </ImageGenContext.Provider>
  );
};

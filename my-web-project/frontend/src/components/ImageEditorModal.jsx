// src/components/ImageEditorModal.jsx
import React, { useState, useEffect } from "react";

const ImageEditorModal = ({ file, onClose, onSend, isSending }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Tạo URL preview khi file thay đổi
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup memory khi component unmount hoặc file đổi
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-base-100 p-4 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col gap-4 relative">
        <h3 className="text-center font-bold text-lg">Xem trước & Gửi</h3>

        {/* Khu vực hiển thị ảnh (Sau này có thể thay bằng thư viện crop) */}
        <div className="flex-1 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh]">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Các nút hành động */}
        <div className="flex justify-end gap-3 mt-2 border-t pt-4">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSending}
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onSend(file)}
            className={`btn btn-primary ${isSending ? "loading" : ""}`}
            disabled={isSending}
          >
            {isSending ? "Đang gửi..." : "Gửi hình ảnh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;

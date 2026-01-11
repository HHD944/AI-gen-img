import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon, Download, Maximize2 } from "lucide-react";
import { useGalleryStore } from "../store/useGalleryStore";

const GalleryModal = ({ isOpen, onClose }) => {
  const { images } = useGalleryStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay mờ dần */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Cửa sổ Popup với hiệu ứng Spring Bouncing cực mượt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: "spring", // Dùng cơ chế lò xo thay vì thời gian tuyến tính
                stiffness: 300,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.2 },
            }}
            className="relative bg-base-100 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <ImageIcon size={20} />
                </div>
                <h2 className="text-lg font-bold">AI Gallery</h2>
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nội dung ảnh */}
            <div className="flex-1 overflow-y-auto p-6 bg-base-200/30 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }} // Hiệu ứng xuất hiện từng ảnh một (stagger)
                    className="group relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-100"
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="btn btn-primary btn-xs">
                        Download
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GalleryModal;

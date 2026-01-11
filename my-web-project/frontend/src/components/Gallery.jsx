import { useGalleryStore } from "../store/useGalleryStore";
import { ImageIcon, Download, Maximize2 } from "lucide-react";

const Gallery = () => {
  const { images, isFetching } = useGalleryStore();

  if (isFetching) return <div className="p-8 text-center">Đang tải ảnh...</div>;

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50">
        <ImageIcon size={48} className="mb-2" />
        <p>Chưa có hình ảnh nào được tạo.</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold mb-4">Bộ sưu tập AI</h2>
      <div className="grid grid-cols-2 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative rounded-lg overflow-hidden border border-base-300 bg-base-200 aspect-square"
          >
            <img
              src={img.url}
              alt={img.prompt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Overlay khi hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button className="p-2 bg-base-100 rounded-full hover:bg-primary transition-colors">
                <Download size={18} />
              </button>
              <button className="p-2 bg-base-100 rounded-full hover:bg-primary transition-colors">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

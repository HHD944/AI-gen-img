import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Search, Image, Edit2, User, ChevronDown, Bell } from "lucide-react";

const ChatSettingSidebar = () => {
  const { selectedUser, messages } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc các tin nhắn có chứa hình ảnh
  const mediaMessages = messages?.filter((msg) => msg.image) || [];

  if (!selectedUser) {
    return (
      <aside className="w-full h-full flex items-center justify-center p-4 text-center text-base-content/40">
        <p>Chọn một cuộc trò chuyện để xem thông tin chi tiết</p>
      </aside>
    );
  }

  return (
    <aside className="w-full h-full flex flex-col bg-base-100 border-l border-base-300 overflow-y-auto custom-scrollbar">
      {/* 1. Profile Header */}
      <div className="p-6 flex flex-col items-center border-b border-base-300">
        <div className="size-24 rounded-full overflow-hidden border-4 border-primary/20 mb-3 shadow-lg">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-bold text-lg text-center">
          {selectedUser.fullName}
        </h3>
        <p className="text-sm text-success">Đang hoạt động</p>
      </div>

      <div className="p-4 space-y-6">
        {/* 2. Search Section */}
        <section>
          <label className="text-xs font-bold uppercase text-base-content/50 px-1 mb-2 block">
            Tìm kiếm tin nhắn
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm nội dung..."
              className="input input-sm input-bordered w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-2.5 top-2 text-base-content/40"
              size={14}
            />
          </div>
        </section>

        {/* 3. Media Gallery Section */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-xs font-bold uppercase text-base-content/50">
              Ảnh & Video
            </label>
            <button className="text-[10px] btn btn-xs btn-ghost text-primary">
              Tất cả
            </button>
          </div>
          {mediaMessages.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {mediaMessages.slice(0, 6).map((msg, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded bg-base-300 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={msg.image}
                    className="w-full h-full object-cover"
                    alt="media"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 border-2 border-dashed border-base-300 rounded-lg">
              <Image size={20} className="text-base-content/20 mb-1" />
              <span className="text-[10px] text-base-content/40">Trống</span>
            </div>
          )}
        </section>

        {/* 4. Settings Section */}
        <section className="space-y-1">
          <label className="text-xs font-bold uppercase text-base-content/50 px-1 mb-2 block">
            Cài đặt box chat
          </label>
          <button className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-all group">
            <div className="p-2 bg-base-300 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <Edit2 size={16} />
            </div>
            <span className="text-sm font-medium">Đổi biệt danh</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-all group">
            <div className="p-2 bg-base-300 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <Bell size={16} />
            </div>
            <span className="text-sm font-medium">Tắt thông báo</span>
          </button>
        </section>
      </div>
    </aside>
  );
};

export default ChatSettingSidebar;

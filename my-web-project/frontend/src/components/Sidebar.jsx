import React, { useEffect } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useChatStore } from "../store/useChatStore";
import { Users } from "lucide-react";
import ChatHistory from "./ChatHistory.jsx";

function Sidebar() {
  // Lấy hàm getUsers và trạng thái loading từ store
  const { getUsers, isUsersLoading } = useChatStore();

  // Gọi API lấy danh sách bạn bè khi component được mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* ChatHistory sẽ chịu trách nhiệm render danh sách */}
        <ChatHistory />
      </div>
    </aside>
  );
}

export default Sidebar;

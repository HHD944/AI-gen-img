import React, { useEffect } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useChatStore } from "../store/useChatStore";
import { Users } from "lucide-react";
import ChatHistory from "./ChatHistory.jsx";

function Sidebar() {
  const { getUsers, users, isUsersLoading } = useChatStore();
  const onlineUser = [];
  useEffect(() => {
    getUsers();
  }, [getUsers]);
  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }
  return (
    <aside className="w-80 border-r">
      <div className="p-4">
        <h3 className="font-semibold mb-2">Chats</h3>
        <ChatHistory />
      </div>
    </aside>
  );
}

export default Sidebar;

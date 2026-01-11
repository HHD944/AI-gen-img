import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
// import Gallery from "../components/Gallery.jsx";
import GalleryModal from "../components/GalleryModal.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import { useAuthStore } from "../store/userAuthStore.js";
import AgentsSidebar from "../components/AgentsSidebar.jsx";
import { useAgentsStore } from "../store/useAgentsStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { Image } from "lucide-react";
import ChatSettingSidebar from "../components/ChatSettingSidebar.jsx";
export default function HomePage() {
  const { selectedUser } = useChatStore();
  const { selectedAgent, getAgents } = useAgentsStore();
  const { authUser } = useAuthStore();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    getAgents();
  }, [getAgents]);

  useEffect(() => {
    if (selectedUser)
      useAgentsStore.setState({ selectedAgent: null, messages: [] });
  }, [selectedUser]);

  useEffect(() => {
    if (selectedAgent)
      useChatStore.setState({ selectedUser: null, messages: [] });
  }, [selectedAgent]);

  const selectedEntity = selectedUser || selectedAgent;
  const entityType = selectedAgent && !selectedUser ? "agent" : "user";

  const totalWidth = 320 + 760 + 288;

  return (
    <div className="h-screen bg-base-200">
      <div
        className="fixed left-1/2 top-20 z-10 transform -translate-x-1/2 h-[calc(100vh-8rem)] box-border"
        style={{ width: `${totalWidth + 50}px` }}
      >
        <div className="bg-base-100 rounded-lg shadow-cl h-full overflow-hidden">
          <div className="flex h-full">
            {/* Cột 1: Sidebar cũ (Danh sách Agent/Chat) */}
            <div className="w-[320px] border-r border-base-300 h-full overflow-auto">
              <Sidebar />
            </div>

            {/* Cột 2: Nội dung Chat chính */}
            <div className="w-[760px] h-full">
              {!selectedEntity ? (
                <NoChatSelected />
              ) : (
                <ChatContainer
                  entity={selectedEntity}
                  entityType={selectedAgent && !selectedUser ? "agent" : "user"}
                />
              )}
            </div>

            {/* Cột 3: Sidebar Setting mới (Bên phải) */}
            <div className="w-[288px] h-full overflow-hidden">
              <ChatSettingSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

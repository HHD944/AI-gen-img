import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import { useAuthStore } from "../store/userAuthStore.js";
import AgentsSidebar from "../components/AgentsSidebar.jsx";
import { useAgentsStore } from "../store/useAgentsStore.js";

import {
  Smile,
  Paperclip,
  Send,
  Settings,
  Phone,
  Video,
  Mic,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore.js";
import Navbar from "../components/Navbar.jsx";

export default function HomePage() {
  const { selectedUser } = useChatStore();
  const { selectedAgent, getAgents } = useAgentsStore();
  const { authUser } = useAuthStore();

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

  // tính toán tổng width: w-80 (320px) + w-[760px] + w-72 (288px) = 1368px
  const totalWidth = 320 + 760 + 288;

  return (
    <div className="h-screen bg-base-200">
      <div
        className="fixed left-1/2 top-20 z-10 transform -translate-x-1/2 h-[calc(100vh-8rem)] box-border"
        style={{ width: `${totalWidth + 50}px` }}
      >
        <div className="bg-base-100 rounded-lg shadow-cl h-full overflow-hidden">
          <div className="flex h-full">
            {/* left: Friends sidebar (fixed width) */}
            <div className="w-full border-r h-full overflow-auto">
              <Sidebar />
            </div>

            {/* center: fixed chat container */}
            <div className="w-[760px] h-full">
              {!selectedEntity ? (
                <NoChatSelected />
              ) : (
                <ChatContainer
                  entity={selectedEntity}
                  entityType={entityType}
                />
              )}
            </div>

            {/* right: Agents sidebar (fixed width) */}
            <div className="w-full border-l h-full overflow-auto">
              <AgentsSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

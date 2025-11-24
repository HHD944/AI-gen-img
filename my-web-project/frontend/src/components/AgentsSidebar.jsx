import React, { useEffect } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useAgentsStore } from "../store/useAgentsStore";
import { Users } from "lucide-react";
import AgentsChatHistory from "./AgentsChatHistory.jsx";

function Sidebar() {
  const { getAgents, agents, isAgentsLoading } = useAgentsStore();
  const onlineUser = [];
  useEffect(() => {
    getAgents();
  }, [getAgents]);
  if (isAgentsLoading) {
    return <SidebarSkeleton />;
  }
  return (
    <aside className="w-80 border-r">
      <div className="p-4">
        <h3 className="font-semibold mb-2">Agents</h3>
        <AgentsChatHistory />
      </div>
    </aside>
  );
}

export default Sidebar;

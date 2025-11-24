import React from "react";
import ChatItem from "./ChatItem.jsx";
import { useAgentsStore } from "../store/useAgentsStore.js";

const ChatHistory = () => {
  const { agents, selectAgent } = useAgentsStore();

  if (!agents || !Array.isArray(agents)) {
    console.warn("Agents not ready:", agents);
    return null;
  }

  return (
    <div className="space-y-1 p-2">
      {agents.map((c) => (
        <ChatItem key={c.id} agent={c} chat={c} onSelect={selectAgent} />
      ))}
    </div>
  );
};

export default ChatHistory;

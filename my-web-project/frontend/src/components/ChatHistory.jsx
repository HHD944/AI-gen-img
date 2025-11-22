import React from "react";
import ChatItem from "./ChatItem.jsx";
import { useChatStore } from "../store/useChatStore.js";

const ChatHistory = () => {
  const { chats, selectChat } = useChatStore();
  return (
    <div className="space-y-1 p-2">
      {chats.map((c) => (
        <ChatItem key={c.id} chat={c} onSelect={selectChat} />
      ))}
    </div>
  );
};

export default ChatHistory;
import React from "react";

const ChatItem = ({ chat, onSelect }) => {
  return (
    <button
      className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition"
      onClick={() => onSelect(chat.id)}
    >
      <div className="avatar">
        <div className="w-10 h-10 rounded-full bg-neutral/10 flex items-center justify-center overflow-hidden">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.title} />
          ) : (
            <span className="text-sm">{chat.title?.[0]}</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="font-medium truncate">{chat.title}</div>
          <div className="text-xs text-base-content/50 ml-2">
            {new Date(chat.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="text-sm text-base-content/60 truncate">
          {chat.lastMessage}
        </div>
      </div>
      {chat.unread > 0 && (
        <div className="badge badge-primary badge-sm ml-2">{chat.unread}</div>
      )}
    </button>
  );
};

export default ChatItem;

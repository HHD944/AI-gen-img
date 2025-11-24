import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useChatStore } from "../store/useChatStore";
import axios from "axios";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const socket = io(SOCKET_URL, { transports: ["websocket"], autoConnect: true });

export default function ChatContainer({ entity, entityType = "user" }) {
  const { selectedUser, messages, setMessages, selectChat } = useChatStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    // join room per chat if you use rooms (optional)
    if (selectedUser) {
      socket.emit("join", { room: selectedUser.id });
    }
    // listen incoming messages
    const onMsg = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    const onTyping = ({ userId, typing }) => {
      if (selectedUser && userId === selectedUser.id) setIsTyping(typing);
    };
    socket.on("chat message", onMsg);
    socket.on("typing", onTyping);
    return () => {
      socket.off("chat message", onMsg);
      socket.off("typing", onTyping);
      if (selectedUser) socket.emit("leave", { room: selectedUser.id });
    };
  }, [selectedUser]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const msgObj = {
      id: `local_${Date.now()}`,
      conversationId: selectedUser?.id || null,
      author: "me",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };
    // optimistic UI
    setMessages((prev) => [...prev, msgObj]);
    setInput("");
    socket.emit("chat message", msgObj); // server should broadcast / persist
    // Optionally persist via REST
    try {
      setSending(true);
      await axios.post("/api/messages/send", {
        conversationId: msgObj.conversationId,
        text: msgObj.text,
      });
    } catch (err) {
      console.error("send error", err);
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await axios.post("/api/images/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const asset = r.data;
      const msgObj = {
        id: `local_${Date.now()}`,
        conversationId: selectedUser?.id || null,
        author: "me",
        image: asset.url || asset.path,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msgObj]);
      socket.emit("chat message", msgObj);
    } catch (err) {
      console.error("upload failed", err);
    }
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = null;
  };

  const onTyping = (val) => {
    socket.emit("typing", { userId: selectedUser?.id, typing: val });
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-base-100">
      <div className="border-b p-4 flex items-center gap-3">
        <div className="font-semibold">
          {selectedUser ? selectedUser.title : "Select a chat"}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!messages?.length && (
          <div className="text-center text-sm text-base-content/50 mt-8">
            No messages yet. Say hi 👋
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.author === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                m.author === "me"
                  ? "bg-primary text-primary-content"
                  : "bg-base-200"
              }`}
            >
              {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
              {m.image && (
                <img
                  src={m.image}
                  alt="img"
                  className="mt-2 rounded-md max-h-48 object-contain"
                />
              )}
              <div className="text-[10px] text-base-content/50 mt-1 text-right">
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-base-content/50">Typing...</div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-3 border-t flex items-center gap-2"
      >
        <label className="btn btn-ghost btn-sm" title="Attach image">
          <input
            ref={fileRef}
            onChange={onFileChange}
            type="file"
            accept="image/*"
            className="hidden"
          />
          <svg
            onClick={() => fileRef.current?.click()}
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
            />
          </svg>
        </label>

        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onTyping(true);
            // stop typing after 1s of no input
            clearTimeout(window.__typingTimer);
            window.__typingTimer = setTimeout(() => {
              onTyping(false);
            }, 1000);
          }}
          placeholder="Type a message..."
          className="input input-bordered flex-1"
        />

        <button
          className={`btn btn-primary btn-sm ${sending ? "loading" : ""}`}
          type="submit"
          disabled={sending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

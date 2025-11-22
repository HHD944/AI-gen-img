import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import { useAuthStore } from "../store/userAuthStore.js";
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
const friendsList = [
  { id: 1, name: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice" },
  { id: 2, name: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob" },
  {
    id: 3,
    name: "Charlie",
    avatar: "https://ui-avatars.com/api/?name=Charlie",
  },
];

const initialMessages = [
  { id: 1, fromMe: false, text: "Hi there! 👋" },
  { id: 2, fromMe: true, text: "Hello! How are you?" },
];

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const [selectedFriend, setSelectedFriend] = useState(friendsList[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const { authUser } = useAuthStore();
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), fromMe: true, text: input }]);
      setInput("");
    }
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

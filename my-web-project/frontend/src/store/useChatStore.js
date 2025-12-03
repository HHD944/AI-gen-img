import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  chats: [
    {
      id: "c1",
      title: "Alice",
      avatar: "https://ui-avatars.com/api/?name=Alice",
      lastMessage: "See you tomorrow 👍",
      updatedAt: Date.now() - 1000 * 60 * 60,
      unread: 0,
      messages: [],
    },
    {
      id: "c2",
      title: "Shopping List",
      avatar: "",
      lastMessage: "I added milk and eggs",
      updatedAt: Date.now() - 1000 * 60 * 30,
      unread: 3,
      messages: [],
    },
  ],
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),

  selectChat: (chatId) => {
    const chat = get().chats.find((c) => c.id === chatId);
    set({ selectedUser: chat });
  },
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
}));

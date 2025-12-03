import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
export const useAgentsStore = create((set, get) => ({
  messages: [],
  agents: [
    {
      id: "agent_design",
      title: "Design AI",
      avatar: "https://ui-avatars.com/api/?name=Alice",
      role: "image-designer",
      desc: "Creative styles & variants",
      lastMessage: "Ready to design your prompt.",
      updatedAt: Date.now() - 1000 * 60,
      unread: 0,
      messages: [],
    },
    {
      id: "agent_edit",
      title: "Edit AI",
      avatar: "https://ui-avatars.com/api/?name=Alice",
      role: "image-editor",
      desc: "Background & retouch edits",
      lastMessage: "Upload your background to start.",
      updatedAt: Date.now() - 1000 * 60 * 30,
      unread: 0,
      messages: [],
    },
    {
      id: "agent_style",
      title: "Style AI",
      avatar: "https://ui-avatars.com/api/?name=Alice",
      role: "style-adapter",
      desc: "LoRA tuning assistant",
      lastMessage: "I can fine-tune styles from examples.",
      updatedAt: Date.now() - 1000 * 60 * 60,
      unread: 0,
      messages: [],
    },
  ],
  selectedAgent: null,
  isAgentsLoading: false,
  isMessagesLoading: false,

  setAgents: (agents) => set({ agents }),
  setMessages: (messages) => set({ messages }),

  selectAgent: (agentId) => {
    const agent = get().agents.find((a) => a.id === agentId) || null;
    set({ selectedAgent: agent, messages: agent?.messages || [] });
  },

  getAgents: async () => {
    set({ isAgentsLoading: true });
    try {
      return get().agents;
    } finally {
      set({ isAgentsLoading: false });
    }
  },

  getMessages: async (agentId) => {
    set({ isMessagesLoading: true });
    try {
      const agent = get().agents.find((a) => a.id === agentId) || null;
      const msgs = agent?.messages || [];
      set({ messages: msgs });
      return msgs;
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  appendMessageToAgent: (msg) => {
    const agent = get().selectedAgent;
    if (!agent) return;
    const updatedAgents = get().agents.map((a) =>
      a.id === agent.id
        ? {
            ...a,
            messages: [...(a.messages || []), msg],
            lastMessage: msg.text || msg.content || "",
            updatedAt: Date.now(),
          }
        : a
    );
    set({
      agents: updatedAgents,
      messages: [...(get().messages || []), msg],
    });
  },

  sendMessageToAgent: async ({
    agentId,
    text,
    author = "user",
    metadata = {},
  }) => {
    const msg = {
      id: `msg_${Date.now()}`,
      role: author === "user" ? "user" : "assistant",
      text,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const updatedAgents = get().agents.map((a) =>
      a.id === agentId
        ? {
            ...a,
            messages: [...(a.messages || []), msg],
            lastMessage: msg.text,
            updatedAt: Date.now(),
          }
        : a
    );
    set({ agents: updatedAgents });

    if (get().selectedAgent?.id === agentId) {
      set({ messages: [...(get().messages || []), msg] });
    }

    return msg;
  },

  clearAgentHistory: (agentId) => {
    const updatedAgents = get().agents.map((a) =>
      a.id === agentId
        ? {
            ...a,
            messages: [],
            lastMessage: "",
            updatedAt: Date.now(),
            unread: 0,
          }
        : a
    );
    set({ agents: updatedAgents });
    if (get().selectedAgent?.id === agentId) {
      set({ messages: [] });
    }
  },

  clearAllHistories: () => {
    const cleared = get().agents.map((a) => ({
      ...a,
      messages: [],
      lastMessage: "",
      unread: 0,
    }));
    set({ agents: cleared, messages: [], selectedAgent: null });
  },
}));

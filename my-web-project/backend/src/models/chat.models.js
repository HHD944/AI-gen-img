import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  author: { type: String }, // user id or "ai"
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  title: { type: String },
  participants: [{ type: String }], // user ids
  lastMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);
export const Conversation = mongoose.model("Conversation", ConversationSchema);
import mongoose from "mongoose";

const ImageAssetSchema = new mongoose.Schema({
  filename: String,
  path: String,
  url: String, // if uploaded to cloud
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  metadata: Object,
  createdAt: { type: Date, default: Date.now },
});

const TrainingJobSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["generate", "tune_with_user_bg", "tune_with_ai_bg"],
    required: true,
  },
  prompt: String,
  backgroundImage: { type: mongoose.Schema.Types.ObjectId, ref: "ImageAsset" }, // optional
  targetImage: { type: mongoose.Schema.Types.ObjectId, ref: "ImageAsset" }, // optional
  adapterPath: String, // where safetensors saved
  status: {
    type: String,
    enum: ["pending", "running", "done", "failed"],
    default: "pending",
  },
  logs: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ImageAsset =
  mongoose.models.ImageAsset || mongoose.model("ImageAsset", ImageAssetSchema);
export const TrainingJob =
  mongoose.models.TrainingJob ||
  mongoose.model("TrainingJob", TrainingJobSchema);

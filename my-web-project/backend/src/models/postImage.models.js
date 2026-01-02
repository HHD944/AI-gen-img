import mongoose from "mongoose";

const postImageSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

postImageSchema.index({ postId: 1, imageId: 1 }, { unique: true });

const PostImage =
  mongoose.models.PostImage || mongoose.model("PostImage", postImageSchema);

export default PostImage;

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  User,
  X,
} from "lucide-react";
import GalleryModal from "../components/GalleryModal";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/userAuthStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const Forum = () => {
  const {
    posts,
    getPosts,
    createPost,
    isPostsLoading,
    isCreatingPost,
    likePost,
  } = usePostStore();
  const { authUser } = useAuthStore();

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Load bài viết khi vào trang
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const handleSelectImageFromGallery = (image) => {
    setSelectedImage(image.url);
    setIsGalleryOpen(false);
  };

  const handlePostSubmit = async () => {
    if (!content.trim() && !selectedImage) return;
    await createPost({ content, image: selectedImage });
    setContent(""); // Clear input
    setSelectedImage(null); // Clear image
  };

  const PostItem = ({ post }) => {
    // Kiểm tra xem mình đã like bài này chưa
    const isLiked = post.likes.includes(authUser?._id);

    return (
      <div className="card bg-base-100 shadow-2xl border border-base-content/10 mb-6 animate-in fade-in zoom-in duration-300">
        <div className="card-body p-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-1">
                  {post.user?.profilePic ? (
                    <img src={post.user.profilePic} alt="avatar" />
                  ) : (
                    <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base hover:underline cursor-pointer">
                    {post.user?.fullName}
                  </h3>
                  <span className="text-xs text-base-content/60">
                    •{" "}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
                <p className="text-sm text-base-content/60">
                  @{post.user?.username || "user"}
                </p>
              </div>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle hover:bg-base-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-3 pl-1">
            <p className="text-base leading-relaxed whitespace-pre-wrap mb-3 text-base-content">
              {post.content}
            </p>

            {post.image && (
              <div className="rounded-xl overflow-hidden border border-base-content/5 bg-base-200/50">
                <img
                  src={post.image}
                  alt="post content"
                  className="w-full h-auto object-cover max-h-[500px] hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
                  onClick={() => window.open(post.image, "_blank")}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-base-content/10">
            <button
              className={`group flex items-center gap-2 transition-colors ${
                isLiked ? "text-red-500" : "hover:text-red-500"
              }`}
              onClick={() => likePost(post._id)}
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-200 ${
                  isLiked ? "fill-red-500 scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="text-sm font-medium">
                {post.likes?.length || 0}
              </span>
            </button>

            <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">
                {post.comments?.length || 0}
              </span>
            </button>

            <button className="group flex items-center gap-2 hover:text-primary transition-colors ml-auto">
              <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-300 py-6 font-sans">
      <div className="max-w-xl mx-auto px-4">
        {/* INPUT BOX */}
        <div className="card bg-base-100 shadow-2xl border border-base-content/10 mb-8">
          <div className="card-body p-4">
            <div className="flex gap-4">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full border">
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="my avatar"
                  />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  className="textarea textarea-ghost w-full p-0 text-base resize-none focus:outline-none focus:bg-transparent h-14 placeholder:text-base-content/40"
                  placeholder="Hôm nay bạn nghĩ gì?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>

                {/* Preview ảnh nếu có chọn từ gallery */}
                {selectedImage && (
                  <div className="relative mt-2 w-24 h-24">
                    <img
                      src={selectedImage}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-base-content/10">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className="btn btn-ghost btn-sm btn-circle text-base-content/60"
                      title="Mở thư viện ảnh"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-warning">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className={`btn btn-primary btn-sm rounded-full px-6 text-white ${
                      isCreatingPost ? "loading" : ""
                    }`}
                    onClick={handlePostSubmit}
                    disabled={
                      isCreatingPost || (!content.trim() && !selectedImage)
                    }
                  >
                    Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEED */}
        <div className="space-y-6">
          {isPostsLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
          ) : (
            posts.map((post) => <PostItem key={post._id} post={post} />)
          )}

          {!isPostsLoading && posts.length === 0 && (
            <p className="text-center opacity-50 py-10">
              Chưa có bài viết nào ở đây.
            </p>
          )}

          <div className="py-10 text-center opacity-50">
            <div className="divider text-xs uppercase tracking-widest font-semibold">
              Hết bài viết
            </div>
          </div>
        </div>
      </div>

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onImageSelect={handleSelectImageFromGallery}
      />
    </div>
  );
};

export default Forum;

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  User,
} from "lucide-react";

const MOCK_CURRENT_USER = {
  name: "Bạn (Demo User)",
  handle: "@me",
  avatar:
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
};

const MOCK_POSTS = [
  {
    id: 1,
    user: {
      name: "Nguyễn Văn A",
      handle: "@nguyenvana",
      avatar: "",
    },
    content:
      "Giao diện này đã được chỉnh lại độ tương phản (High Contrast). Card sáng hơn nền và có viền rõ ràng. 😎",
    image: null,
    likes: 45,
    comments: 2,
    time: "30p",
  },
  {
    id: 2,
    user: {
      name: "Photography Hub",
      handle: "@photo_hub",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    },
    content:
      "Hoàng hôn hôm nay tại Đà Lạt. Cảnh sắc tuyệt vời để chữa lành tâm hồn 🌲☁️",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop",
    likes: 1240,
    comments: 89,
    time: "2h",
  },
  {
    id: 3,
    user: {
      name: "Tech Review",
      handle: "@tech_vn",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop",
    },
    content:
      "AI đang thay đổi cách chúng ta code. Các bạn nghĩ sao về tương lai của Dev?",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    likes: 320,
    comments: 56,
    time: "1d",
  },
];

const Forum = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const PostItem = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      // Card Post
      <div className="card bg-base-100 shadow-2xl border border-base-content/10 mb-6 animate-in fade-in zoom-in duration-300">
        <div className="card-body p-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-1">
                  {post.user.avatar ? (
                    <img src={post.user.avatar} alt="avatar" />
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
                    {post.user.name}
                  </h3>
                  <span className="text-sm text-base-content/60">
                    • {post.time}
                  </span>
                </div>
                <p className="text-sm text-base-content/60">
                  {post.user.handle}
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
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-base-content/10">
            <button
              className="group flex items-center gap-2 hover:text-red-500 transition-colors"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-200 ${
                  isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "group-hover:scale-110"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isLiked ? "text-red-500" : ""
                }`}
              >
                {post.likes + (isLiked ? 1 : 0)}
              </span>
            </button>

            <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>

            <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
              <Repeat className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
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
    // THAY ĐỔI: Thêm class 'font-sans'
    // Điều này sẽ ghi đè font "lỗi" của theme (như Cyberpunk) bằng font hệ thống (Arial/Roboto) hỗ trợ tiếng Việt.
    <div className="min-h-screen bg-base-300 py-6 font-sans">
      <div className="max-w-xl mx-auto px-4">
        {/* INPUT BOX */}
        <div className="card bg-base-100 shadow-2xl border border-base-content/10 mb-8">
          <div className="card-body p-4">
            <div className="flex gap-4">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <img src={MOCK_CURRENT_USER.avatar} alt="my avatar" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  className="textarea textarea-ghost w-full p-0 text-base resize-none focus:outline-none focus:bg-transparent h-14 placeholder:text-base-content/40"
                  placeholder="Hôm nay có gì mới?..."
                ></textarea>

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-base-content/10">
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-warning">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="btn btn-primary btn-sm rounded-full px-6 text-white font-medium shadow-md hover:shadow-lg">
                    Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEED */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}

          <div className="py-10 text-center opacity-50">
            <div className="divider text-xs uppercase tracking-widest font-semibold">
              Hết bài viết
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;

import Post from "../models/post.models.js";

// 1. Lấy tất cả bài viết (Dùng cho Feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Bài mới nhất hiện lên đầu
      .populate("user", "fullName profilePic username") // Lấy thông tin user đăng bài
      .populate("comments.user", "fullName profilePic"); // Lấy thông tin user bình luận

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài viết" });
  }
};

// 2. Tạo bài viết mới
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id; // Lấy từ middleware protectRoute

    if (!content && !image) {
      return res
        .status(400)
        .json({ message: "Bài viết phải có nội dung hoặc ảnh" });
    }

    const newPost = new Post({
      user: userId,
      content,
      image,
    });

    await newPost.save();

    // Trả về bài viết đã có thông tin user để frontend hiển thị ngay
    const populatedPost = await newPost.populate(
      "user",
      "fullName profilePic username"
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo bài viết" });
  }
};

// 3. Like/Unlike bài viết
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài viết" });

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Nếu đã like thì tiến hành Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Nếu chưa like thì thêm vào mảng likes
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json(post.likes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xử lý like" });
  }
};

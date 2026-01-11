import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Frontend URL
  },
});

// 1. Tạo Map để lưu trữ người dùng online
// Key: userId (từ MongoDB) -> Value: socketId
const userSocketMap = {};

// 2. Hàm helper để lấy socketId của người nhận (Dùng trong Message Controller)
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // 3. Lấy userId được gửi từ Frontend (useAuthStore -> connectSocket)
  const userId = socket.handshake.query.userId;

  // 4. Nếu có userId, lưu vào Map
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // 5. Gửi sự kiện "getOnlineUsers" cho TẤT CẢ client
  // Trả về danh sách các Keys (chính là mảng các userId đang online)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- Các sự kiện khác (nếu có) ---
  socket.on("chat message", (msg) => {
    // Logic này thường dùng cho Global Chat,
    // còn chat 1-1 chúng ta đã xử lý qua API + Socket ở Controller rồi
    io.emit("chat message", msg);
  });

  // 6. Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    // Xóa user khỏi Map
    if (userId) {
      delete userSocketMap[userId];
    }

    // Gửi lại danh sách mới cho tất cả client để cập nhật trạng thái
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

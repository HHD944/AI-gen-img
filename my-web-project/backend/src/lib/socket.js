import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Xử lý sự kiện chat cơ bản
  socket.on("chat message", (msg) => {
    // Có thể lưu vào database tại đây (dùng models)
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
export { io, app, server };

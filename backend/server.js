// server.js

const express = require("express");
const { createServer } = require("http"); // Import createServer from http
const { Server } = require("socket.io"); // Import Server from socket.io
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const Chat = require("./models/chatModel");
require("dotenv").config();

connectDB();
const app = express();
const httpServer = createServer(app); // Use createServer from http
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    try {
      socket.join(userData._id);
      console.log(`${userData._id} joined socket room`);
      socket.emit("connected");
    } catch (error) {
      console.error(`Error during setup: ${error.message}`);
    }
  });

  socket.on("join chat", (room) => {
    try {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    } catch (error) {
      console.error(`Error during joining chat: ${error.message}`);
    }
  });

  socket.on("typing", (room) => socket.to(room).emit("typing"));
  socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

  socket.on("new message", async (newMessageReceived) => {
    try {
      io.to(newMessageReceived.room).emit(
        "message received",
        newMessageReceived
      );
    } catch (error) {
      console.error(`Error processing new message: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket.io");
  });
});

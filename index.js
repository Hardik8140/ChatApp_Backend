const express = require("express");
// const http = require("http");
const cors = require("cors");
// const PORT = process.env.PORT;
require("dotenv").config();
const { connection } = require("./src/config/db");
const { userRouter } = require("./src/routes/users.routes");
const { messagesRouter } = require("./src/routes/messages.routes");
const socket = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users/api/auth", userRouter);
app.use("/api/messages", messagesRouter);

app.get("/", async (req, res) => {
  try {
    res.setHeader("text-content", "text/html");
    res.status(200).send("<h1>Welcome to the ApexChatter Server</h1>");
  } catch (error) {
    res.status(400).json({ error });
  }
});

const server = app.listen(8080, async () => {
  try {
    await connection;
    console.log("Connected to the database successfully");
    console.log(`Server is Runing on PORT ${8080}`);
  } catch (error) {
    console.log(error);
  }
});

const io = socket(server, {
  cors: {
    origin: `http://localhost:3000`,
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;
const socketPort = process.env.SOCKET_PORT || 3001;

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Socket.io server
  const socketServer = createServer();
  const io = new Server(socketServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = new Map();
  const userSockets = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-jwt-secret");
      
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    userSockets.set(socket.id, socket.userId);

    // Notify others that user is online
    socket.broadcast.emit("user:online", socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining chat rooms
    socket.on("chat:join", (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on("chat:leave", (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Handle message sending
    socket.on("message:send", (message) => {
      // Broadcast to all users in the chat except sender
      socket.to(`chat:${message.chatId}`).emit("message:receive", message);
    });

    // Handle typing indicators
    socket.on("typing:start", (data) => {
      socket.to(`chat:${data.chatId}`).emit("typing:start", {
        userId: socket.userId,
        chatId: data.chatId,
        userName: `User ${socket.userId}`, // In real app, get from database
      });
    });

    socket.on("typing:stop", (data) => {
      socket.to(`chat:${data.chatId}`).emit("typing:stop", {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);

      // Notify others that user is offline
      socket.broadcast.emit("user:offline", socket.userId);
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  socketServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(socketPort, () => {
      console.log(`> Socket.io server ready on http://${hostname}:${socketPort}`);
    });
});


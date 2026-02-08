const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.dbURI;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  },
});

app.set("socketio", io);

io.on("connection", (socket) => {
  socket.on("joinRideRoom", (rideId) => {
    socket.join(rideId);
  });

  socket.on("leaveRideRoom", (rideId) => {
    socket.leave(rideId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running with Socket.io Support" });
});

// Error Handlers
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// Database & Server Start
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Use server.listen instead of app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Socket.io is active and listening`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
};

startServer();

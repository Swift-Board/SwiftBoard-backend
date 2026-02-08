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
const MONGODB_URI = process.env.dbURI

const allowedOrigins = [
  "https://swift-board-lac.vercel.app",
  "http://localhost:3000",
];

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
  },
});

app.set("socketio", io);

// Socket Logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("joinRideRoom", (rideId) => socket.join(rideId));
  socket.on("leaveRideRoom", (rideId) => socket.leave(rideId));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// --- MIDDLEWARE ---

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running with Socket.io Support" });
});

// --- ERROR HANDLING ---
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

app.use((err, req, res, next) => {
  console.error("Error Logged:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --- DATABASE & SERVER START ---
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
};

startServer();

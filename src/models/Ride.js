const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    departureTime: { type: Date, required: true },
    vehicleType: {
      type: String,
      enum: ["car", "bus", "sienna"],
      required: true,
    },
    price: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    driver: {
      name: String,
      rating: Number,
      avatar: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["available", "full", "completed", "cancelled"],
      default: "available",
    },
  },
  { timestamps: true },
);

// Index for faster searching by route and date
rideSchema.index({ origin: 1, destination: 1, departureTime: 1 });

module.exports = mongoose.model("Ride", rideSchema);

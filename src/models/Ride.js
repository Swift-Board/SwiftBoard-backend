const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    vehicleType: {
      type: String,
      enum: ["bus", "sienna", "car"],
      required: true,
    },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    occupiedSeats: { type: [Number], default: [] },
    park: { type: String, required: true },
    image: { type: String },
    driver: {
      name: { type: String },
      rating: { type: Number, default: 5.0 },
    },
    status: {
      type: String,
      enum: ["available", "full", "cancelled", "completed"],
      default: "available",
    },
  },
  { timestamps: true },
);

// This is correct now
module.exports = mongoose.models.Ride || mongoose.model("Ride", rideSchema);

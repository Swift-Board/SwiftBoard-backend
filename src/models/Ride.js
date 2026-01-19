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
    occupiedSeats: { type: [Number], default: [] },
    totalSeats: { type: Number, required: true },
    park: { type: String, default: "Express Terminal" },
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

rideSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.occupiedSeats.length;
});

rideSchema.index({ origin: 1, destination: 1, departureTime: 1 });

module.exports = mongoose.model("Ride", rideSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    seatNumbers: [Number],
    paymentReference: { type: String, required: true, unique: true },
    bookingRef: {
      type: String,
      unique: true,
      default: () =>
        `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
    amountPaid: Number,
    company: { type: String, default: "Express Terminal" }, // For filtering
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    seatNumbers: { type: [Number], required: true },
    paymentReference: { type: String, required: true },
    bookingRef: {
      type: String,
      default: () =>
        `EXP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
    amountPaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");
const Ride = require("../models/Ride");
const Booking = require("../models/Booking");

// 1. SEARCH RIDES
exports.searchRides = async (req, res) => {
  try {
    const { origin, destination, date, vehicleType } = req.query;
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const query = {
      origin: { $regex: new RegExp(`^${origin.trim()}$`, "i") },
      destination: { $regex: new RegExp(`^${destination.trim()}$`, "i") },
      departureTime: { $gte: startOfDay, $lte: endOfDay },
      status: "available",
    };

    if (vehicleType && vehicleType !== "all") query.vehicleType = vehicleType;

    const rides = await Ride.find(query).sort({ departureTime: 1 });

    res.status(200).json({ success: true, results: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bookSeats = async (req, res) => {
  try {
    const { seatNumbers, paymentReference } = req.body;
    const rideId = req.params.id;
    const userId = req.user.id;

    // Validation
    if (
      !seatNumbers ||
      !Array.isArray(seatNumbers) ||
      seatNumbers.length === 0
    ) {
      throw new Error("Invalid seat numbers provided");
    }

    if (!paymentReference) {
      throw new Error("Payment reference is required");
    }

    console.log("📝 Booking Request:", {
      rideId,
      userId,
      seatNumbers,
      paymentReference,
    });

    // 1. Find the ride
    const ride = await Ride.findById(rideId);

    if (!ride) {
      throw new Error("Ride not found");
    }

    if (ride.status === "cancelled") {
      throw new Error("This ride has been cancelled");
    }

    // 2. Check if any requested seats are already occupied
    const alreadyOccupied = seatNumbers.filter((seat) =>
      ride.occupiedSeats.includes(seat),
    );

    if (alreadyOccupied.length > 0) {
      throw new Error(`Seats already booked: ${alreadyOccupied.join(", ")}`);
    }

    // 3. Check if there's enough capacity
    const newOccupiedCount = ride.occupiedSeats.length + seatNumbers.length;
    if (newOccupiedCount > ride.totalSeats) {
      throw new Error("Not enough available seats");
    }

    // 4. Update ride with new occupied seats
    ride.occupiedSeats.push(...seatNumbers);

    // Update status if ride is now full
    if (ride.occupiedSeats.length >= ride.totalSeats) {
      ride.status = "full";
    }

    await ride.save();

    // 5. Create booking record
    const booking = await Booking.create({
      user: userId,
      ride: rideId,
      seatNumbers,
      paymentReference,
      amountPaid: ride.price * seatNumbers.length,
      status: "pending",
    });

    console.log("✅ Booking successful:", {
      bookingId: booking._id,
      seats: seatNumbers,
      totalOccupied: ride.occupiedSeats.length,
    });

    // 6. Emit socket event
    const io = req.app.get("socketio");
    if (io) {
      io.to(rideId.toString()).emit("seatsUpdated", ride.occupiedSeats);
      console.log("📡 Socket event emitted for ride:", rideId);
    }

    // 7. Send success response
    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      ride: {
        ...ride.toObject(),
        availableSeats: ride.totalSeats - ride.occupiedSeats.length,
      },
      booking,
    });
  } catch (error) {
    console.error("❌ Booking error:", error.message);

    const statusCode = error.message.includes("not found") ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Booking failed. Please try again.",
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = { user: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bookings = await Booking.find(query)
      .populate("ride")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET SINGLE RIDE
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

// 4. POST - ADD NEW RIDE
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. PATCH/PUT - UPDATE RIDE
exports.updateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. DELETE - REMOVE RIDE
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    res
      .status(200)
      .json({ success: true, message: "Ride deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

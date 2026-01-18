const Ride = require("../models/Ride");

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
      status: "available", // Only show rides that aren't cancelled or completed
    };

    if (vehicleType && vehicleType !== "all") query.vehicleType = vehicleType;

    const rides = await Ride.find(query).sort({ departureTime: 1 });

    // Virtuals like 'availableSeats' will be included in the JSON response
    res.status(200).json({ success: true, results: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bookSeats = async (req, res) => {
  console.log("📩 Incoming Booking Request:", {
    rideId: req.params.id,
    body: req.body,
  });

  try {
    const { seatNumbers, paymentReference } = req.body;

    // Validation
    if (!seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats selected",
      });
    }

    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference required",
      });
    }

    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $ne: "cancelled" },
        occupiedSeats: { $nin: seatNumbers },
      },
      {
        $addToSet: { occupiedSeats: { $each: seatNumbers } },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!ride) {
      return res.status(400).json({
        success: false,
        message: "Seats unavailable or already booked",
      });
    }

    if (
      ride.occupiedSeats.length >= ride.totalSeats &&
      ride.status !== "full"
    ) {
      ride.status = "full";
      await ride.save();
    }

    const io = req.app.get("socketio");
    if (io) {
      io.to(ride._id.toString()).emit("seatsUpdated", ride.occupiedSeats);
    } else {
      console.warn("⚠️ Socket.io not available for broadcast");
    }

    res.status(200).json({
      success: true,
      message: "Seats booked successfully",
      ride,
    });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. GET SINGLE RIDE
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

// 4. POST - ADD NEW RIDE
exports.createRide = async (req, res) => {
  try {
    // Ensure occupiedSeats defaults to empty if not provided
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
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. DELETE - REMOVE RIDE
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res
      .status(200)
      .json({ success: true, message: "Ride deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

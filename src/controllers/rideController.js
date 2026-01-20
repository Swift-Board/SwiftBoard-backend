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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { seatNumbers, paymentReference } = req.body;
    const rideId = req.params.id;
    const userId = req.user.id; // Ensure your auth middleware provides this

    // 1. Update the Ride (Atomic check to prevent double-booking)
    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        status: { $ne: "cancelled" },
        occupiedSeats: { $nin: seatNumbers },
      },
      { $addToSet: { occupiedSeats: { $each: seatNumbers } } },
      { new: true, session },
    );

    if (!ride) throw new Error("Seats unavailable or already booked");

    // 2. Create the Booking Record (This is what shows up in Travel Details)
    const booking = await Booking.create(
      [
        {
          user: userId,
          ride: rideId,
          seatNumbers,
          paymentReference,
          amountPaid: ride.price * seatNumbers.length,
          status: "pending",
        },
      ],
      { session },
    );

    // 3. Update Ride status to 'full' if needed
    if (ride.occupiedSeats.length >= ride.totalSeats) {
      ride.status = "full";
      await ride.save({ session });
    }

    await session.commitTransaction();

    // 4. Socket.io Real-time update
    const io = req.app.get("socketio");
    if (io) io.to(rideId.toString()).emit("seatsUpdated", ride.occupiedSeats);

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
      ride,
      booking: booking[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = { user: req.user.id };

    // Filter by status if provided (pending, completed, etc)
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bookings = await Booking.find(query)
      .populate("ride") // This pulls in Origin, Destination, and Departure Time
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

const Ride = require("../models/Ride");

// 1. GET ALL/SEARCH (Already optimized for YYYY-MM-DD)
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

// 2. GET SINGLE RIDE
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
};

// 3. POST - ADD NEW RIDE
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. PATCH/PUT - UPDATE RIDE
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

// 5. DELETE - REMOVE RIDE
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

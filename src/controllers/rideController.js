const Ride = require("../models/Ride");

exports.searchRides = async (req, res) => {
  try {
    const { origin, destination, date, vehicleType } = req.query;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    console.log(
      "Searching between:",
      startOfDay.toISOString(),
      "and",
      endOfDay.toISOString(),
    );

    const query = {
      origin: { $regex: new RegExp(`^${origin.trim()}$`, "i") },
      destination: { $regex: new RegExp(`^${destination.trim()}$`, "i") },
      departureTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "available",
    };

    if (vehicleType && vehicleType !== "all") {
      query.vehicleType = vehicleType;
    }

    const rides = await Ride.find(query).sort({ departureTime: 1 });
    res.status(200).json({ success: true, results: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

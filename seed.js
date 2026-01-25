const mongoose = require("mongoose");
const Ride = require("./src/models/Ride");
const Booking = require("./src/models/Booking");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.dbURI);
    console.log("Connected to MongoDB...");
    try {
        await mongoose.connection.collection('rides').dropIndex('paymentReference_1');
        console.log("Cleaned up old incorrect index.");
    } catch (e) {
        console.log("No old index to drop, moving on...");
    }

    // 2. Clear existing rides
    await Ride.deleteMany({});
    console.log("Cleared old rides.");

    const origins = ["Port Harcourt", "Lagos", "Abuja"];
    const destinations = ["Lagos", "Abuja", "Jos", "Warri", "Enugu", "Calabar"];
    const vehicles = ["bus", "sienna", "car"];
    const testRides = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      origins.forEach((origin) => {
        destinations.forEach((dest, index) => {
          if (origin === dest) return;

          const vType = vehicles[index % vehicles.length];
          const hour = 7 + (index % 10);
          const total = vType === "bus" ? 14 : vType === "sienna" ? 7 : 4;

          testRides.push({
            origin: origin,
            destination: dest,
            departureTime: new Date(
              `${dateString}T${hour.toString().padStart(2, "0")}:00:00.000Z`,
            ),
            vehicleType: vType,
            price: 15000 + index * 1000,
            totalSeats: total,
            occupiedSeats: [],
            park: `${origin} Main Terminal`,
            image:
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069",
            driver: {
              name: `Captain ${dest}`,
              rating: 4.8,
            },
            // Ensure this status exists in your RIDE schema enum
            status: "available",
          });
        });
      });
    }

    // Force Mongoose to use the Ride model specifically
    await Ride.insertMany(testRides, { validateBeforeSave: true });

    console.log(`✅ Success! Seeded ${testRides.length} rides.`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    // Log full error if it's not a validation error
    if (!err.errors) console.error(err);
    process.exit(1);
  }
}

seed();

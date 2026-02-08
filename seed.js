const mongoose = require("mongoose");
const Ride = require("./src/models/Ride");
const Booking = require("./src/models/Booking");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.dbURI);
    console.log("Connected to MongoDB...");

    // 1. Index cleanup
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

    // --- DATE LOGIC FOR FEBRUARY 2026 ---
    const now = new Date();
    const currentYear = now.getFullYear(); // 2026
    const currentMonth = now.getMonth();    // February (index 1)
    
    // Get total days in current month (28 for Feb 2026)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Loop from today until the end of the month
    for (let d = now.getDate(); d <= daysInMonth; d++) {
      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;

      origins.forEach((origin) => {
        destinations.forEach((dest, index) => {
          if (origin === dest) return;

          const vType = vehicles[index % vehicles.length];
          const hour = 6 + (index % 12); // Spread departures between 6 AM and 6 PM
          const total = vType === "bus" ? 14 : vType === "sienna" ? 7 : 4;

          testRides.push({
            origin: origin,
            destination: dest,
            departureTime: new Date(`${dateString}T${hour.toString().padStart(2, "0")}:00:00.000Z`),
            vehicleType: vType,
            price: 18000 + (index * 500), // Updated pricing for 2026
            totalSeats: total,
            occupiedSeats: [],
            park: `${origin} Main Terminal`,
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069",
            driver: {
              name: `Captain ${dest} ${index + 1}`,
              rating: (4.5 + Math.random() * 0.5).toFixed(1), // Random rating between 4.5 and 5.0
            },
            status: "available",
          });
        });
      });
    }

    // 3. Batch insert
    await Ride.insertMany(testRides, { validateBeforeSave: true });

    console.log(`✅ Success! Seeded ${testRides.length} rides for the rest of February 2026.`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    if (err.errors) console.error(err.errors);
    process.exit(1);
  }
}

seed();
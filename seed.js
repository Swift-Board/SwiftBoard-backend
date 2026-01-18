const mongoose = require("mongoose");
const Ride = require("./src/models/Ride");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.dbURI);
    await Ride.deleteMany({});

    const cities = ["Lagos", "Abuja", "Jos", "Warri", "Enugu", "Calabar"];
    const vehicles = ["bus", "sienna", "car"];
    const testRides = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      cities.forEach((city, index) => {
        const vType = vehicles[index % vehicles.length];
        const hour = 7 + index;
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;

        // Logical seat totals for Nigerian transport
        const total = vType === "bus" ? 14 : vType === "sienna" ? 7 : 4;

        // Generate random occupied seats
        const occupied = [];
        const numToOccupy = Math.floor(Math.random() * 4); // 0 to 3 seats taken
        while (occupied.length < numToOccupy) {
          let s = Math.floor(Math.random() * total) + 1;
          if (!occupied.includes(s)) occupied.push(s);
        }

        testRides.push({
          origin: "Port Harcourt",
          destination: city,
          departureTime: new Date(`${dateString}T${formattedHour}:00:00.000Z`),
          vehicleType: vType,
          price: 15000 + index * 2000,
          totalSeats: total,
          occupiedSeats: occupied,
          park: `${city} Luxury Park`,
          driver: {
            name: `Captain ${city} Express`,
            rating: 4.8,
          },
          status: "available",
        });
      });
    }

    await Ride.insertMany(testRides);
    console.log("✅ Database Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();

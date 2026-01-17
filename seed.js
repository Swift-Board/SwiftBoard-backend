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

    // Loop through the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      cities.forEach((city, index) => {
        // Fix: Use 7 instead of 07 to avoid octal literal error
        const hour = 7 + index;
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;

        testRides.push({
          origin: "Port Harcourt",
          destination: city,
          departureTime: new Date(`${dateString}T${formattedHour}:00:00.000Z`),
          vehicleType: vehicles[index % vehicles.length],
          price: 15000 + index * 2500,
          availableSeats: 10,
          totalSeats: 14,
          driver: {
            name: `Captain ${city} Express`,
            rating: 4.5 + Math.random() * 0.5,
          },
          status: "available",
        });
      });
    }

    await Ride.insertMany(testRides);
    console.log(
      `✅ Success: Seeded ${testRides.length} rides for the next 7 days!`,
    );
    process.exit();
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seed();

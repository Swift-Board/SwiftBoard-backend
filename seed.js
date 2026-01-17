// seed.js
const Ride = require('./src/models/Ride'); 

async function seed() {
  const targetDate = "2026-01-18"; // PICK A SPECIFIC DATE FOR TESTING

  const testRides = [
    {
      origin: "Port Harcourt",
      destination: "Lagos",
      departureTime: new Date(`${targetDate}T10:00:00.000Z`), // 10 AM UTC
      vehicleType: "bus",
      price: 15000,
      availableSeats: 12,
      totalSeats: 14,
      status: "available"
    }
  ];

  await Ride.deleteMany({}); // Clear DB first
  await Ride.insertMany(testRides);
  console.log("Data seeded for January 18th, 2026");
}
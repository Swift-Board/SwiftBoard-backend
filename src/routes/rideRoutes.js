const express = require("express");
const router = express.Router();
const {
  searchRides,
  createRide,
  getRideById,
  updateRide,
  deleteRide,
  bookSeats,
  getMyBookings,
} = require("../controllers/rideController");

// Search Endpoint
router.get("/search", searchRides);

// CRUD Endpoints
router.post("/", createRide);

router.route("/:id").get(getRideById).patch(updateRide).delete(deleteRide);

router.patch("/:id/book", bookSeats);

router.get("/my-bookings", protect, getMyBookings);

module.exports = router;

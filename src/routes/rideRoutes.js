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
const { protect } = require("../middlewares/authMiddleware");

// Search Endpoint
router.get("/search", searchRides);

router.get("/my-bookings", protect, getMyBookings);

router.patch("/:id/book", protect, bookSeats);

router.post("/", createRide);

router.route("/:id").get(getRideById).patch(updateRide).delete(deleteRide);

module.exports = router;
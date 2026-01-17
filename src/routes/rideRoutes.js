const express = require("express");
const router = express.Router();
const {
  searchRides,
  createRide,
  getRideById,
  updateRide,
  deleteRide,
} = require("../controllers/rideController");

// Search Endpoint
router.get("/search", searchRides);

// CRUD Endpoints
router.post("/", createRide);

router.route("/:id").get(getRideById).patch(updateRide).delete(deleteRide);

module.exports = router;

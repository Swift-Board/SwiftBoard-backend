const express = require("express");
const router = express.Router();
const { searchRides } = require("../controllers/rideController");

router.get("/search", searchRides);

module.exports = router;

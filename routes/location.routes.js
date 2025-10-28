// const express = require("express");
// const router = express.Router();

// const {
//   saveLocation,
//   getActiveLocation,
// } = require("../controller/location.controller"); // ✅ No dot between "location" and "controller"

// router.post("/save", saveLocation);
// router.get("/active", getActiveLocation);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  addLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
} = require("../controller/location.controller");

router.post("/add-location", addLocation);             // Add new location
router.get("/alllocation", getAllLocations);          // Get all locations
router.put("/updatelocation/:id", updateLocation);        // Update existing location
router.delete("/deletelocation/:id", deleteLocation);     // Delete location

module.exports = router;

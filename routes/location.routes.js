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

router.post("/save", addLocation);             // Add new location
router.get("/active", getAllLocations);          // Get all locations
router.put("/:id", updateLocation);        // Update existing location
router.delete("/:id", deleteLocation);     // Delete location

module.exports = router;

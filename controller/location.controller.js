// const Location = require("../models/Location");

// // ✅ Add or Update Location
// exports.saveLocation = async (req, res) => {
//   try {
//     const { name, latitude, longitude } = req.body;
//     if (!name || !latitude || !longitude) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Make other locations inactive
//     await Location.updateMany({}, { isActive: false });

//     const newLocation = await Location.create({
//       name,
//       latitude,
//       longitude,
//       isActive: true,
//     });

//     res.status(200).json({
//       message: "Office location saved successfully",
//       location: newLocation,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to save location", error: err.message });
//   }
// };

// // ✅ Get Active Location
// exports.getActiveLocation = async (req, res) => {
//   try {
//     const location = await Location.findOne({ isActive: true });
//     if (!location)
//       return res.status(404).json({ message: "No active location found" });

//     res.status(200).json({ message: "Active location fetched", location });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch active location", error: err.message });
//   }
// };


const Location = require("../models/Location");

// ✅ Add New Location
exports.addLocation = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const location = await Location.create({
      name,
      latitude,
      longitude,
      isActive: true, // optional — you can keep this for future toggling
    });

    res.status(200).json({
      message: "Location added successfully",
      location,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add location", error: err.message });
  }
};

// ✅ Get All Locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    if (!locations.length)
      return res.status(404).json({ message: "No locations found" });

    res.status(200).json({ message: "All locations fetched", locations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch locations", error: err.message });
  }
};

// ✅ Update Location (optional, for admin edits)
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude } = req.body;

    const updated = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Location not found" });

    res.status(200).json({ message: "Location updated", location: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update location", error: err.message });
  }
};

// ✅ Delete Location (optional)
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete location", error: err.message });
  }
};

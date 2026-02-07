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
    const { name, latitude, longitude, fullAddress } = req.body;

    // ✅ Validation
    if (!name || !latitude || !longitude || !fullAddress) {
      return res.status(400).json({ message: "All fields are required (name, latitude, longitude, fullAddress)" });
    }

    // ✅ Create new location entry
    const location = await Location.create({
      name,
      latitude,
      longitude,
      fullAddress,
      isActive: true, // optional: you can use this later to deactivate a location
    });

    res.status(200).json({
      success: true,
      message: "Location added successfully",
      location,
    });
  } catch (err) {
    console.error("Add Location Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add location",
      error: err.message,
    });
  }
};


// ✅ Get All Locations
// exports.getAllLocations = async (req, res) => {
//   try {
//     const locations = await Location.find({});
//     if (!locations.length)
//       return res.status(404).json({ message: "No locations found" });

//     res.status(200).json({ message: "All locations fetched", locations });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch locations", error: err.message });
//   }
// };

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({
      clientId: { $exists: false } // Sirf wahi locations jismein clientId field nahi hai
    });
    
    if (!locations.length)
      return res.status(404).json({ message: "No locations found without clientId" });

    res.status(200).json({ 
      message: "Locations without clientId fetched successfully", 
      count: locations.length,
      locations 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to fetch locations", 
      error: err.message 
    });
  }
};

// ✅ Update Location (optional, for admin edits)
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fullAddress, latitude, longitude } = req.body;

    const updated = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude, fullAddress },
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

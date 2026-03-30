// const express = require("express");
// const { createClientRequest, getAllClientRequests, updateRequestStatus } = require("../controller/clientRequest.controller");
// const router = express.Router();

// router.post("/register", createClientRequest);
// router.get("/requests", getAllClientRequests);
// router.put("/request/:id", updateRequestStatus);

// module.exports = router;


// const express = require("express");
// const { createClientRequest, getAllClientRequests, updateRequestStatus } = require("../controller/clientRequest.controller");
// const router = express.Router();

// router.post("/register", createClientRequest);
// router.get("/requests", getAllClientRequests);
// router.put("/request/:id", updateRequestStatus);

// module.exports = router;

const express = require("express");
const { 
  createClientRequest, 
  saveSelectedProducts,
  getAllClientRequests,
  getRequestById,
  updateRequestStatus 
} = require("../controller/clientRequest.controller");
const router = express.Router();

// Public routes
router.post("/register", createClientRequest);
router.post("/select-products", saveSelectedProducts);

// Admin routes (you should add authentication middleware here)
router.get("/requests", getAllClientRequests);
router.get("/request/:id", getRequestById);
router.put("/request/:id", updateRequestStatus);

module.exports = router;
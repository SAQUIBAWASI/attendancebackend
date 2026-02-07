// const express = require("express");
// const { createClientRequest, getAllClientRequests, updateRequestStatus } = require("../controller/clientRequest.controller");
// const router = express.Router();

// router.post("/register", createClientRequest);
// router.get("/requests", getAllClientRequests);
// router.put("/request/:id", updateRequestStatus);

// module.exports = router;


const express = require("express");
const { createClientRequest, getAllClientRequests, updateRequestStatus } = require("../controller/clientRequest.controller");
const router = express.Router();

router.post("/register", createClientRequest);
router.get("/requests", getAllClientRequests);
router.put("/request/:id", updateRequestStatus);

module.exports = router;
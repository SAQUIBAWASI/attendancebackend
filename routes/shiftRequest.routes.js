const router = require("express").Router();
const controller = require("../controller/shiftRequest.controller");

router.post("/add", controller.createShiftRequest);
router.get("/all", controller.getAllShiftRequests);
router.get("/employee/:employeeId", controller.getEmployeeShiftRequests);
router.put("/status/:id", controller.updateShiftRequestStatus);

module.exports = router;

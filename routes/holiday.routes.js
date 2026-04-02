const router = require("express").Router();
const controller = require("../controller/holiday.controller");

router.post("/add", controller.addHoliday);
router.get("/all", controller.getHolidays);
router.put("/:id", controller.updateHoliday); // ✅ Added
router.delete("/:id", controller.deleteHoliday);

module.exports = router;

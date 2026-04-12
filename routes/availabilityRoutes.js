const express = require("express");
const authMiddleware = require("../middlewares/authMidlleware");
const { requireDoctor } = require("../middlewares/roleMiddleware");
const {
  updateAvailabilityController,
  getAvailableSlotsController,
} = require("../controllers/doctorCtrl");
const router = express.Router();

router.post(
  "/update",
  authMiddleware,
  requireDoctor,
  updateAvailabilityController,
);
router.post("/slots", authMiddleware, getAvailableSlotsController);

module.exports = router;

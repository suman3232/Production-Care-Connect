const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
} = require("../controllers/userCtrl");
const authMidlleware = require("../middlewares/authMidlleware");

const router = express.Router();

router.post("/login", loginController);

router.post("/register", registerController);

router.post("/getUserData", authMidlleware, authController);

router.post("/apply-doctor", authMidlleware, applyDoctorController);

router.post(
  "/get-all-notification",
  authMidlleware,
  getallnotificationController
);

router.post(
  "/delete-all-notification",
  authMidlleware,
  deleteallnotificationController
);

router.get("/getallDoctors", authMidlleware, getAllDoctorController);

router.post("/book-appointment", authMidlleware, bookAppointmentController);

router.post(
  "/booking-availbility",
  authMidlleware,
  bookingAvailabilityController
);

router.get("/user-appointments", authMidlleware, userAppointmentsController);

module.exports = router;

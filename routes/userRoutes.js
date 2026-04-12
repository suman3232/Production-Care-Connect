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
  initiateBookingController,
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
  userAppointmentsController,
  getAppointmentByIdController,
  addConsultationController,
  logHealthController,
  getHealthLogsController,
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
  getallnotificationController,
);

router.post(
  "/delete-all-notification",
  authMidlleware,
  deleteallnotificationController,
);

router.get("/getallDoctors", authMidlleware, getAllDoctorController);

router.post("/initiate-booking", authMidlleware, initiateBookingController);

router.post(
  "/booking-availbility",
  authMidlleware,
  bookingAvailabilityController,
);

router.post("/create-order", authMidlleware, createRazorpayOrderController);

router.post("/verify-payment", authMidlleware, verifyRazorpayPaymentController);

router.get("/user-appointments", authMidlleware, userAppointmentsController);
router.get(
  "/appointment/:appointmentId",
  authMidlleware,
  getAppointmentByIdController,
);
router.post("/add-consultation", authMidlleware, addConsultationController);
router.post("/log-health", authMidlleware, logHealthController);
router.get("/get-logs/:userId", authMidlleware, getHealthLogsController);

module.exports = router;

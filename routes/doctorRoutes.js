const express = require("express");
const authMiddleware = require("../middlewares/authMidlleware");
const { requireDoctor } = require("../middlewares/roleMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIDController,
  doctorAppointmentController,
  getConsultationController,
  assignPlanController,
  getPatientLogsController,
  updateStatusController,
  updateAvailabilityController,
  getAvailableSlotsController,
  getAppointmentController,
  addConsultationController,
  completeConsultationController,
} = require("../controllers/doctorCtrl");
const router = express.Router();

router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

router.post("/updateProfile", authMiddleware, updateProfileController);

router.post("/getDoctorById", authMiddleware, getDoctorByIDController);

router.get("/doctor-appointments", authMiddleware, doctorAppointmentController);

router.get(
  "/get-consultation/:appointmentId",
  authMiddleware,
  requireDoctor,
  getConsultationController,
);

router.post(
  "/assign-plan",
  authMiddleware,
  requireDoctor,
  assignPlanController,
);

router.get(
  "/patient-logs/:userId",
  authMiddleware,
  requireDoctor,
  getPatientLogsController,
);

router.post("/update-status", authMiddleware, updateStatusController);

router.get(
  "/get-appointment/:appointmentId",
  authMiddleware,
  requireDoctor,
  getAppointmentController,
);

router.post(
  "/add-consultation",
  authMiddleware,
  requireDoctor,
  addConsultationController,
);

router.post(
  "/complete-consultation",
  authMiddleware,
  requireDoctor,
  completeConsultationController,
);

module.exports = router;

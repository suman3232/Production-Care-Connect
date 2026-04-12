const express = require("express");
const authMiddleware = require("../middlewares/authMidlleware");
const { requireDoctor } = require("../middlewares/roleMiddleware");
const {
  assignHealthPlanController,
  getPatientHealthPlansController,
  logHealthActivityController,
  getPatientHealthLogsController,
  getHealthAnalyticsController,
  getDoctorPatientPlansController,
  updateHealthPlanStatusController,
} = require("../controllers/activityCtrl");

const router = express.Router();

// Health Plan Management (Doctors only)
router.post("/assign-plan", authMiddleware, requireDoctor, assignHealthPlanController);
router.put("/update-plan-status", authMiddleware, requireDoctor, updateHealthPlanStatusController);

// Patient Health Plans
router.get("/patient-plans", authMiddleware, getPatientHealthPlansController);
router.get("/doctor-patients", authMiddleware, requireDoctor, getDoctorPatientPlansController);

// Health Activity Logging
router.post("/log-activity", authMiddleware, logHealthActivityController);
router.get("/logs/:planId", authMiddleware, getPatientHealthLogsController);

// Health Analytics
router.get("/analytics/:planId", authMiddleware, getHealthAnalyticsController);

module.exports = router;

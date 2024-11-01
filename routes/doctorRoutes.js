const express = require("express");
const authMiddleware = require("../middlewares/authMidlleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIDController,
  doctorAppointmentController,
  updateStatusController,
} = require("../controllers/doctorCtrl");
const router = express.Router();

router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

router.post("/updateProfile", authMiddleware, updateProfileController);

router.post("/getDoctorById", authMiddleware, getDoctorByIDController);

router.get('/doctor-appointments', authMiddleware, doctorAppointmentController)

router.post('/update-status', authMiddleware, updateStatusController)

module.exports = router;

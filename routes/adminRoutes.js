const express = require("express");
const authMiddleware = require("../middlewares/authMidlleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  getDashboardStatsController,
} = require("../controllers/adminCtrl");
const router = express.Router();

router.get("/getAllUsers", authMiddleware, requireAdmin, getAllUsersController);

router.get(
  "/getAllDoctors",
  authMiddleware,
  requireAdmin,
  getAllDoctorsController,
);

router.post(
  "/changeAccountStatus",
  authMiddleware,
  requireAdmin,
  changeAccountStatusController,
);

router.get(
  "/dashboard-stats",
  authMiddleware,
  requireAdmin,
  getDashboardStatsController,
);

module.exports = router;

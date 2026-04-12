const healthPlanModel = require("../models/healthPlanModel");
const healthLogModel = require("../models/healthLogModel");
const userModel = require("../models/userModel");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

// Assign health plan to patient after appointment
const assignHealthPlanController = async (req, res) => {
  try {
    const {
      appointmentId,
      water,
      exercise,
      sleep,
      duration,
      customTasks,
      notes,
    } = req.body;
    const doctorId = req.userId; // doctor assigning the plan

    // Verify appointment exists and belongs to doctor
    const appointment = await appointmentModel.findOne({
      _id: appointmentId,
      doctorId,
    });

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found or not authorized",
      });
    }

    // Check if appointment is in correct status
    if (!["approved", "ongoing"].includes(appointment.status)) {
      return res.status(400).send({
        success: false,
        message:
          "Can only assign health plan to approved or ongoing appointments",
      });
    }

    // Check if plan already exists for this appointment
    const existingPlan = await healthPlanModel.findOne({ appointmentId });
    if (existingPlan) {
      return res.status(400).send({
        success: false,
        message: "Health plan already exists for this appointment",
      });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const healthPlan = new healthPlanModel({
      doctorId,
      userId: appointment.userId,
      appointmentId,
      water,
      exercise,
      sleep,
      duration,
      startDate,
      endDate,
      customTasks: customTasks || [],
      notes,
    });

    await healthPlan.save();

    // Update appointment status to completed and link health plan
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      status: "completed",
      healthPlanId: healthPlan._id,
      completedAt: new Date(),
    });

    res.status(201).send({
      success: true,
      message: "Health plan assigned successfully and appointment completed",
      data: healthPlan,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error assigning health plan",
      error,
    });
  }
};

// Get health plans for a patient
const getPatientHealthPlansController = async (req, res) => {
  try {
    const userId = req.userId;

    const plans = await healthPlanModel
      .find({ userId, status: "active" })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Health plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving health plans",
      error,
    });
  }
};

// Log daily health activity
const logHealthActivityController = async (req, res) => {
  try {
    const {
      planId,
      date,
      water,
      exercise,
      sleep,
      customTasksCompleted,
      notes,
    } = req.body;
    const userId = req.userId;

    // Verify plan belongs to user and is active
    const plan = await healthPlanModel.findOne({
      _id: planId,
      userId,
      status: "active",
    });

    if (!plan) {
      return res.status(404).send({
        success: false,
        message: "Health plan not found or not active",
      });
    }

    // Check if date is within plan duration
    const logDate = new Date(date);
    if (logDate < plan.startDate || logDate > plan.endDate) {
      return res.status(400).send({
        success: false,
        message: "Date is outside the health plan duration",
      });
    }

    // Check if log already exists for this date
    const existingLog = await healthLogModel.findOne({
      userId,
      planId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999),
      },
    });

    if (existingLog) {
      // Update existing log
      existingLog.water = water;
      existingLog.exercise = exercise;
      existingLog.sleep = sleep;
      existingLog.customTasksCompleted = customTasksCompleted || [];
      existingLog.notes = notes;
      existingLog.completed = true; // Mark as completed when updated
      await existingLog.save();

      return res.status(200).send({
        success: true,
        message: "Health activity updated successfully",
        data: existingLog,
      });
    }

    // Create new log
    const healthLog = new healthLogModel({
      userId,
      planId,
      date: logDate,
      water,
      exercise,
      sleep,
      customTasksCompleted: customTasksCompleted || [],
      notes,
      completed: true,
    });

    await healthLog.save();

    res.status(201).send({
      success: true,
      message: "Health activity logged successfully",
      data: healthLog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error logging health activity",
      error,
    });
  }
};

// Get health logs for a patient
const getPatientHealthLogsController = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.userId;

    // Verify plan belongs to user
    const plan = await healthPlanModel.findOne({
      _id: planId,
      userId,
    });

    if (!plan) {
      return res.status(404).send({
        success: false,
        message: "Health plan not found",
      });
    }

    const logs = await healthLogModel
      .find({ userId, planId })
      .sort({ date: -1 });

    res.status(200).send({
      success: true,
      message: "Health logs retrieved successfully",
      data: logs,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving health logs",
      error,
    });
  }
};

// Get health analytics for a patient
const getHealthAnalyticsController = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.userId;

    // Verify plan belongs to user
    const plan = await healthPlanModel.findOne({
      _id: planId,
      userId,
    });

    if (!plan) {
      return res.status(404).send({
        success: false,
        message: "Health plan not found",
      });
    }

    const logs = await healthLogModel
      .find({ userId, planId })
      .sort({ date: 1 });

    // Calculate analytics
    const analytics = {
      totalDays: logs.length,
      completedDays: logs.filter((log) => log.completed).length,
      averageWaterIntake: 0,
      averageExerciseMinutes: 0,
      averageSleepHours: 0,
      targetAchievement: {
        water: 0,
        exercise: 0,
        sleep: 0,
      },
      customTasksCompletion: 0,
      healthScore: 0,
      weeklyProgress: [],
    };

    if (logs.length > 0) {
      const totalWater = logs.reduce((sum, log) => sum + log.water, 0);
      const totalExercise = logs.reduce((sum, log) => sum + log.exercise, 0);
      const totalSleep = logs.reduce((sum, log) => sum + log.sleep, 0);

      analytics.averageWaterIntake = totalWater / logs.length;
      analytics.averageExerciseMinutes = totalExercise / logs.length;
      analytics.averageSleepHours = totalSleep / logs.length;

      // Calculate target achievement percentage
      const waterAchievements = logs.filter(
        (log) => log.water >= plan.water,
      ).length;
      const exerciseAchievements = logs.filter(
        (log) => log.exercise >= plan.exercise,
      ).length;
      const sleepAchievements = logs.filter(
        (log) => log.sleep >= plan.sleep,
      ).length;

      analytics.targetAchievement.water =
        (waterAchievements / logs.length) * 100;
      analytics.targetAchievement.exercise =
        (exerciseAchievements / logs.length) * 100;
      analytics.targetAchievement.sleep =
        (sleepAchievements / logs.length) * 100;

      // Calculate custom tasks completion
      const totalCustomTasks = plan.customTasks
        ? plan.customTasks.length * logs.length
        : 0;
      const completedCustomTasks = logs.reduce((sum, log) => {
        return (
          sum +
          (log.customTasksCompleted
            ? log.customTasksCompleted.filter((task) => task.completed).length
            : 0)
        );
      }, 0);

      analytics.customTasksCompletion =
        totalCustomTasks > 0
          ? (completedCustomTasks / totalCustomTasks) * 100
          : 0;

      // Calculate health score: (completed goals + completed custom tasks) / total goals × 100
      const totalGoals = 3 + (plan.customTasks ? plan.customTasks.length : 0); // water, exercise, sleep + custom tasks
      const completedGoals =
        (waterAchievements +
          exerciseAchievements +
          sleepAchievements +
          completedCustomTasks) /
        logs.length;
      analytics.healthScore =
        totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Group by week for progress chart
      const weeklyData = {};
      logs.forEach((log) => {
        const weekStart = moment(log.date).startOf("week").format("YYYY-MM-DD");
        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = {
            week: weekStart,
            water: 0,
            exercise: 0,
            sleep: 0,
            healthScore: 0,
            count: 0,
          };
        }
        weeklyData[weekStart].water += log.water;
        weeklyData[weekStart].exercise += log.exercise;
        weeklyData[weekStart].sleep += log.sleep;

        // Calculate weekly health score
        const weeklyCompletedGoals =
          (log.water >= plan.water ? 1 : 0) +
          (log.exercise >= plan.exercise ? 1 : 0) +
          (log.sleep >= plan.sleep ? 1 : 0) +
          (log.customTasksCompleted
            ? log.customTasksCompleted.filter((task) => task.completed).length
            : 0);
        weeklyData[weekStart].healthScore +=
          (weeklyCompletedGoals / totalGoals) * 100;
        weeklyData[weekStart].count += 1;
      });

      analytics.weeklyProgress = Object.values(weeklyData).map((week) => ({
        week: week.week,
        water: week.water / week.count,
        exercise: week.exercise / week.count,
        sleep: week.sleep / week.count,
        healthScore: week.healthScore / week.count,
      }));
    }

    res.status(200).send({
      success: true,
      message: "Health analytics retrieved successfully",
      data: {
        plan,
        analytics,
        logs,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error retrieving health analytics",
      error,
    });
  }
};

// Get patients' health plans for doctor monitoring
const getDoctorPatientPlansController = async (req, res) => {
  try {
    const doctorId = req.userId;

    const plans = await healthPlanModel
      .find({ doctorId, status: "active" })
      .populate("userId", "name email phone")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    // Get recent logs for each plan
    const plansWithLogs = await Promise.all(
      plans.map(async (plan) => {
        const recentLogs = await healthLogModel
          .find({ planId: plan._id })
          .sort({ date: -1 })
          .limit(7); // Last 7 days

        const completionRate =
          recentLogs.length > 0
            ? (recentLogs.filter((log) => log.completed).length /
                recentLogs.length) *
              100
            : 0;

        return {
          ...plan.toObject(),
          recentLogs,
          completionRate: Math.round(completionRate),
        };
      }),
    );

    res.status(200).send({
      success: true,
      message: "Patient health plans retrieved successfully",
      data: plansWithLogs,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving patient health plans",
      error,
    });
  }
};

// Update health plan status
const updateHealthPlanStatusController = async (req, res) => {
  try {
    const { planId, status } = req.body;
    const doctorId = req.userId;

    const plan = await healthPlanModel.findOneAndUpdate(
      { _id: planId, doctorId },
      { status },
      { new: true },
    );

    if (!plan) {
      return res.status(404).send({
        success: false,
        message: "Health plan not found or not authorized",
      });
    }

    res.status(200).send({
      success: true,
      message: "Health plan status updated successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating health plan status",
      error,
    });
  }
};

module.exports = {
  assignHealthPlanController,
  getPatientHealthPlansController,
  logHealthActivityController,
  getPatientHealthLogsController,
  getHealthAnalyticsController,
  getDoctorPatientPlansController,
  updateHealthPlanStatusController,
};

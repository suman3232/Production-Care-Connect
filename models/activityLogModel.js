const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    waterIntake: {
      type: Number,
      default: 0,
    },
    exerciseMinutes: {
      type: Number,
      default: 0,
    },
    sleepHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const activityLogModel = mongoose.model("activityLogs", activityLogSchema);
module.exports = activityLogModel;

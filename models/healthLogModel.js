const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "healthPlans",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    water: {
      type: Number,
      min: 0,
      default: 0,
    },
    exercise: {
      type: Number,
      min: 0,
      default: 0,
    },
    sleep: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
    },
    customTasksCompleted: [
      {
        taskId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Compound index to ensure one log per user per plan per date
healthLogSchema.index({ userId: 1, planId: 1, date: 1 }, { unique: true });

const healthLogModel = mongoose.model("healthLogs", healthLogSchema);
module.exports = healthLogModel;

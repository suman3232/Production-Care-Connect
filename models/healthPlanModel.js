const mongoose = require("mongoose");

const healthPlanSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      required: true,
    },
    water: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    exercise: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sleep: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    duration: {
      type: Number, // in days
      required: true,
      min: 1,
      max: 365,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    customTasks: [
      {
        title: {
          type: String,
          required: true,
        },
        target: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

const healthPlanModel = mongoose.model("healthPlans", healthPlanSchema);
module.exports = healthPlanModel;

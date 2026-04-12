const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },

    doctorInfo: {
      type: Object,
      required: true,
    },

    userInfo: {
      type: Object,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },

    time: {
      type: String,
      required: true,
    },

    appointmentDateTime: {
      type: Date,
      required: true,
    },

    consultationType: {
      type: String,
      enum: ["online", "offline"],
      required: true,
      default: "offline",
    },

    meetingLink: {
      type: String,
      default: null,
    },

    clinicAddress: {
      type: String,
      default: null,
    },

    // Payment fields
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentId: {
      type: String,
      default: null,
    },

    orderId: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      default: 0,
    },

    // Health plan reference
    healthPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "healthPlans",
      default: null,
    },

    // Completion tracking
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;

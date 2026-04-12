const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      required: true,
    },
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
    symptoms: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    consultationNotes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const consultationModel = mongoose.model("consultations", consultationSchema);
module.exports = consultationModel;

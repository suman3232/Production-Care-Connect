const moment = require("moment");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModel");
const consultationModel = require("../models/consultationModel");
const healthPlanModel = require("../models/healthPlanModel");
const healthLogModel = require("../models/healthLogModel");
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in fetching doctor details",
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true },
    );
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

const getDoctorByIDController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info Fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor info",
    });
  }
};

const doctorAppointmentController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await appointmentModel
      .find({
        doctorId: doctor._id,
      })
      .populate("userId", "name email phone");

    res.status(200).send({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in fetching appointments",
    });
  }
};

const updateAvailabilityController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.userId },
      {
        timings: [
          moment(req.body.timings[0], "HH:mm").format("HH:mm"),
          moment(req.body.timings[1], "HH:mm").format("HH:mm"),
        ],
        slotDuration: req.body.slotDuration || 30,
      },
      { new: true },
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Availability updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating availability",
      error: error.message,
    });
  }
};

const getConsultationController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.doctorId.toString() !== doctor._id.toString()
    ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to view this consultation",
      });
    }
    const consultation = await consultationModel.findOne({ appointmentId });
    if (!consultation) {
      return res.status(404).send({
        success: false,
        message: "Consultation not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Consultation fetched successfully",
      data: consultation,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching consultation",
      error: error.message,
    });
  }
};

const assignPlanController = async (req, res) => {
  try {
    const { appointmentId, water, exercise, sleep, duration, notes } = req.body;
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.doctorId.toString() !== doctor._id.toString()
    ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to assign a plan for this appointment",
      });
    }
    const existingPlan = await healthPlanModel.findOne({ appointmentId });
    if (existingPlan) {
      return res.status(400).send({
        success: false,
        message: "A health plan already exists for this appointment",
      });
    }
    const plan = new healthPlanModel({
      doctorId: doctor._id,
      userId: appointment.userId,
      appointmentId,
      water,
      exercise,
      sleep,
      duration,
      notes,
      startDate: new Date(),
      endDate: moment().add(duration, "days").toDate(),
    });
    await plan.save();

    appointment.healthPlanId = plan._id;
    await appointment.save();

    const patient = await userModel.findById(appointment.userId);
    if (patient) {
      patient.notification.push({
        type: "health-plan-assigned",
        message: "Your doctor has assigned a health plan",
        onClickPath: "/activity",
      });
      await patient.save();
    }
    res.status(201).send({
      success: true,
      message: "Health plan assigned successfully",
      data: plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error assigning health plan",
      error: error.message,
    });
  }
};

const getPatientLogsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }
    const plan = await healthPlanModel.findOne({ userId, status: "active" });
    if (!plan) {
      return res.status(404).send({
        success: false,
        message: "No active health plan found for this patient",
      });
    }
    const logs = await healthLogModel.find({ userId }).sort({ date: 1 });
    const consistency =
      logs.length > 0
        ? Math.round(
            (logs.filter((log) => log.completed).length / logs.length) * 100,
          )
        : 0;
    const summary = {
      totalLogs: logs.length,
      consistency,
      averageWater:
        logs.reduce((sum, log) => sum + log.water, 0) / (logs.length || 1),
      averageExercise:
        logs.reduce((sum, log) => sum + log.exercise, 0) / (logs.length || 1),
      averageSleep:
        logs.reduce((sum, log) => sum + log.sleep, 0) / (logs.length || 1),
    };
    res.status(200).send({
      success: true,
      message: "Patient logs fetched successfully",
      data: { plan, logs, summary },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching patient logs",
      error: error.message,
    });
  }
};

const getAvailableSlotsController = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }

    if (!doctor.timings || doctor.timings.length < 2) {
      return res.status(200).send({
        success: true,
        message: "Doctor availability is not configured",
        data: { availableSlots: [], doctor },
      });
    }

    const startTime = moment(doctor.timings[0], "HH:mm");
    const endTime = moment(doctor.timings[1], "HH:mm");
    const duration = doctor.slotDuration || 30;
    const slots = [];
    let current = startTime.clone();

    while (current.isBefore(endTime)) {
      slots.push(current.format("HH:mm"));
      current = current.add(duration, "minutes");
    }

    const requestedDate = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    const bookedAppointments = await appointmentModel.find({
      doctorId,
      date: requestedDate,
    });
    const bookedTimes = bookedAppointments.map((apt) => apt.time);
    const availableSlots = slots.filter(
      (timeSlot) => !bookedTimes.includes(timeSlot),
    );

    res.status(200).send({
      success: true,
      message: "Available slots fetched successfully",
      data: { availableSlots, doctor },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true },
    );

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification.push({
        type: "Status-Updated",
        message: `Your appointment status has been updated to ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in update status",
    });
  }
};

const getAppointmentController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.doctorId.toString() !== doctor._id.toString()
    ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to view this appointment",
      });
    }

    res.status(200).send({
      success: true,
      message: "Appointment fetched successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

const addConsultationController = async (req, res) => {
  try {
    const { appointmentId, consultationNotes, diagnosis, prescription } =
      req.body;

    if (!appointmentId || !consultationNotes || !diagnosis || !prescription) {
      return res.status(400).send({
        success: false,
        message: "All consultation fields are required",
      });
    }

    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.doctorId.toString() !== doctor._id.toString()
    ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to add consultation for this appointment",
      });
    }

    if (appointment.paymentStatus !== "paid") {
      return res.status(400).send({
        success: false,
        message: "Payment must be completed before consultation",
      });
    }

    if (appointment.status !== "approved") {
      return res.status(400).send({
        success: false,
        message: "Consultation can only be added for approved appointments",
      });
    }

    const existingConsultation = await consultationModel.findOne({
      appointmentId,
    });
    let consultation;

    if (existingConsultation) {
      // Update existing consultation
      consultation = await consultationModel.findByIdAndUpdate(
        existingConsultation._id,
        {
          consultationNotes,
          diagnosis,
          prescription,
          status: "completed",
        },
        { new: true },
      );
    } else {
      // Create new consultation
      consultation = new consultationModel({
        appointmentId,
        doctorId: doctor._id,
        userId: appointment.userId,
        consultationNotes,
        diagnosis,
        prescription,
        status: "completed",
      });
      await consultation.save();

      // Update appointment with consultation reference
      appointment.consultationId = consultation._id;
      await appointment.save();
    }

    res.status(200).send({
      success: true,
      message: existingConsultation
        ? "Consultation updated successfully"
        : "Consultation added successfully",
      data: consultation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error adding consultation",
      error: error.message,
    });
  }
};

const completeConsultationController = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (
      !appointment ||
      appointment.doctorId.toString() !== doctor._id.toString()
    ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to complete this consultation",
      });
    }

    // Update appointment status to completed
    appointment.status = "completed";
    appointment.completedAt = new Date();
    await appointment.save();

    // Update consultation status if exists
    const consultation = await consultationModel.findOne({ appointmentId });
    if (consultation) {
      consultation.status = "completed";
      await consultation.save();
    }

    // Send notification to patient
    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification.push({
        type: "consultation-completed",
        message:
          "Your consultation has been completed. Check your health plan.",
        onClickPath: "/activity",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Consultation completed successfully",
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error completing consultation",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIDController,
  doctorAppointmentController,
  getConsultationController,
  assignPlanController,
  getPatientLogsController,
  updateAvailabilityController,
  getAvailableSlotsController,
  updateStatusController,
  getAppointmentController,
  addConsultationController,
  completeConsultationController,
};

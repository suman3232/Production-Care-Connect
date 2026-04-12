const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const consultationModel = require("../models/consultationModel");
const healthPlanModel = require("../models/healthPlanModel");
const healthLogModel = require("../models/healthLogModel");
const pendingBookingModel = require("../models/pendingBookingModel");
const moment = require("moment");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");
  let current = start.clone();

  while (current.isBefore(end)) {
    slots.push(current.format("HH:mm"));
    current = current.add(duration, "minutes");
  }

  return slots;
};

const registerController = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists",
        success: false,
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
    const newuser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newuser.save();

    // Respond with success
    res.status(201).send({ message: "Register successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).send({
        message: "Email and password are required",
        success: false,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).send({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        message: "Invalid email or password",
        success: false,
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).send({
        message: "JWT secret not configured",
        success: false,
      });
    }

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login success", success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: `Error in login controller ${error.message}`,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    user.password = undefined;
    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    const savedDoctor = await newDoctor.save();

    // Find the admin user and check if they exist
    const adminUser = await userModel.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(404).send({
        success: false,
        message: "Admin user not found",
      });
    }

    // Initialize notification array if it doesn't exist
    if (!adminUser.notification) {
      adminUser.notification = [];
    }

    // Add the notification
    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For a Doctor Account`,
      data: newDoctor._id,
      name: newDoctor.firstName + " " + newDoctor.lastName,
      onClickPath: "/admin/doctors",
    });

    // Update the admin user's notifications
    const updatedAdmin = await userModel.findByIdAndUpdate(adminUser._id, {
      notification: adminUser.notification,
    });

    // Send success response
    res.status(201).send({
      success: true,
      message: "Doctor Applied Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: `Error While Applying For Doctor: ${error.message}`,
      details: error.errors
        ? Object.keys(error.errors).map(
            (k) => `${k}: ${error.errors[k].message}`,
          )
        : [],
    });
  }
};

const getallnotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.seennotification.push(...user.notification);
    user.notification = [];
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error: error.message,
    });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to delete all notifications",
      error: error.message,
    });
  }
};

const getAllDoctorController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).send({
        success: false,
        error,
        message: "Error While Fetching Doctors",
      });
  }
};

const initiateBookingController = async (req, res) => {
  try {
    const { doctorId, date, time, doctorInfo, userInfo, consultationType } =
      req.body;

    if (
      !doctorId ||
      !date ||
      !time ||
      !doctorInfo ||
      !userInfo ||
      !consultationType
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Doctor, date, time, consultation type, and user information are required",
      });
    }

    if (!["online", "offline"].includes(consultationType)) {
      return res.status(400).send({
        success: false,
        message: "Consultation type must be either 'online' or 'offline'",
      });
    }

    const requestedDate = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    const requestedTime = moment(time, "HH:mm").format("HH:mm");

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }

    const existingAppointment = await appointmentModel.findOne({
      doctorId,
      date: requestedDate,
      time: requestedTime,
    });
    if (existingAppointment) {
      return res.status(400).send({
        success: false,
        message: "This time slot has already been booked",
      });
    }

    if (!doctor.timings || doctor.timings.length !== 2) {
      return res.status(400).send({
        success: false,
        message: "Doctor availability is not set yet",
      });
    }

    const allowedConsultationModes =
      Array.isArray(doctor.consultationModes) &&
      doctor.consultationModes.length > 0
        ? doctor.consultationModes
        : ["online", "offline"];

    if (!allowedConsultationModes.includes(consultationType)) {
      return res.status(400).send({
        success: false,
        message: `This doctor does not offer ${consultationType} consultations`,
      });
    }

    if (consultationType === "offline" && !doctor.clinicAddress) {
      return res.status(400).send({
        success: false,
        message:
          "Doctor's clinic address is required for offline consultations",
      });
    }

    const duration = doctor.slotDuration || 30;
    const validSlots = generateTimeSlots(
      doctor.timings[0],
      doctor.timings[1],
      duration,
    );

    if (!validSlots.includes(requestedTime)) {
      return res.status(400).send({
        success: false,
        message:
          "Selected time is not aligned with the doctor's available slot schedule",
      });
    }

    const amount =
      doctor.feesperConsultation || doctorInfo?.feesperConsultation || 0;
    if (amount <= 0) {
      return res.status(400).send({
        success: false,
        message: "Appointment fee is not configured for this doctor",
      });
    }

    // Create Razorpay order
    const amountInPaise = Math.round(amount * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save pending booking
    const pendingBooking = new pendingBookingModel({
      userId: req.userId,
      doctorId,
      doctorInfo,
      userInfo,
      date: requestedDate,
      time: requestedTime,
      consultationType,
      orderId: order.id,
      amount,
    });
    await pendingBooking.save();

    res.status(200).send({
      success: true,
      message: "Payment order created successfully",
      data: order,
      key: process.env.RAZORPAY_KEY_ID,
      pendingBookingId: pendingBooking._id,
    });
  } catch (error) {

    res.status(500).send({
      success: false,
      error,
      message: "Error while initiating booking",
    });
  }
};

const createRazorpayOrderController = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).send({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId.toString() !== req.userId.toString()) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to initialize payment for this appointment",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).send({
        success: false,
        message: "Appointment is already paid",
      });
    }

    const amountInPaise = Math.round((appointment.amount || 0) * 100);
    if (amountInPaise <= 0) {
      return res.status(400).send({
        success: false,
        message: "Appointment amount is not configured",
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: appointmentId,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    appointment.orderId = order.id;
    await appointment.save();

    res.status(200).send({
      success: true,
      message: "Razorpay order created successfully",
      data: order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).send({
      success: false,
      message: "Unable to create Razorpay order",
      error: error.message,
    });
  }
};

const verifyRazorpayPaymentController = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).send({
        success: false,
        message: "Payment verification data is required",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Find and delete pending booking
      await pendingBookingModel.findOneAndDelete({
        orderId: razorpay_order_id,
      });
      return res.status(400).send({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Find pending booking
    const pendingBooking = await pendingBookingModel.findOne({
      orderId: razorpay_order_id,
    });
    if (!pendingBooking) {
      return res.status(404).send({
        success: false,
        message: "Pending booking not found",
      });
    }

    // Generate meeting link for online consultations
    let meetingLink = null;
    let clinicAddress = null;

    if (pendingBooking.consultationType === "online") {
      meetingLink =
        pendingBooking.doctorInfo.meetingLink ||
        `https://meet.doctorapp.com/${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
    } else {
      clinicAddress =
        pendingBooking.doctorInfo.clinicAddress ||
        pendingBooking.doctorInfo.address ||
        "Clinic address not available";
    }

    // Create the appointment
    const appointmentDateTime = moment(
      `${pendingBooking.date} ${pendingBooking.time}`,
      "YYYY-MM-DD HH:mm",
    ).toDate();

    const newAppointment = new appointmentModel({
      userId: pendingBooking.userId,
      doctorId: pendingBooking.doctorId,
      doctorInfo: pendingBooking.doctorInfo,
      userInfo: pendingBooking.userInfo,
      date: pendingBooking.date,
      time: pendingBooking.time,
      appointmentDateTime,
      consultationType: pendingBooking.consultationType,
      meetingLink,
      clinicAddress,
      status: "approved",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: pendingBooking.amount,
    });
    await newAppointment.save();

    // Delete pending booking
    await pendingBookingModel.findByIdAndDelete(pendingBooking._id);

    // Notify doctor
    const doctorUser = await userModel.findOne({
      _id: pendingBooking.doctorInfo.userId,
    });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "New-appointment-request",
        message: `New ${pendingBooking.consultationType} appointment from ${pendingBooking.userInfo.name}`,
        onClickPath: "/doctor-appointments",
      });
      await doctorUser.save();
    }

    res.status(200).send({
      success: true,
      message: "Payment verified and appointment created successfully",
      data: {
        appointmentId: newAppointment._id,
        consultationType: newAppointment.consultationType,
        meetingLink,
        clinicAddress,
      },
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).send({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

const bookingAvailabilityController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }

    const requestedDate = moment(req.body.date, "DD-MM-YYYY").format(
      "YYYY-MM-DD",
    );
    const requestedTime = moment(req.body.time, "HH:mm").format("HH:mm");

    const appointments = await appointmentModel.find({
      doctorId: req.body.doctorId,
      date: requestedDate,
      time: requestedTime,
    });

    if (appointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "Selected slot is already booked",
      });
    }

    if (!doctor.timings || doctor.timings.length !== 2) {
      return res.status(200).send({
        success: false,
        message: "Doctor availability has not been configured yet",
      });
    }

    const validSlots = generateTimeSlots(
      doctor.timings[0],
      doctor.timings[1],
      doctor.slotDuration || 30,
    );

    if (!validSlots.includes(requestedTime)) {
      return res.status(200).send({
        success: false,
        message: "Selected time is not part of available slots",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Appointment available",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.userId,
    });

    res.status(200).send({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting appointments",
    });
  }
};

const getAppointmentByIdController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log("Fetching appointment with ID:", appointmentId);
    console.log("Requesting user ID:", req.userId);

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found for ID:", appointmentId);
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    console.log("Found appointment:", {
      appointmentId: appointment._id,
      appointmentUserId: appointment.userId,
      requestingUserId: req.userId,
    });

    if (appointment.userId.toString() !== req.userId.toString()) {
      console.log(
        "Authorization check failed:",
        appointment.userId.toString(),
        "!==",
        req.userId.toString(),
      );
      return res.status(403).send({
        success: false,
        message: "Unauthorized access to appointment",
      });
    }

    // Add join call logic
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDateTime);
    const timeDiff = appointmentTime - now;
    const minutesDiff = timeDiff / (1000 * 60);

    // Allow joining within ±10 minutes of scheduled time
    const canJoinCall =
      appointment.consultationType === "online" &&
      appointment.status === "approved" &&
      minutesDiff >= -10 &&
      minutesDiff <= 10;

    const responseData = {
      ...appointment.toObject(),
      canJoinCall,
      timeUntilAppointment: minutesDiff > 0 ? Math.ceil(minutesDiff) : 0,
      isAppointmentTime: minutesDiff >= -10 && minutesDiff <= 10,
    };

    res.status(200).send({
      success: true,
      message: "Appointment fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

const addConsultationController = async (req, res) => {
  try {
    const { appointmentId, symptoms, description, duration } = req.body;
    if (!appointmentId || !symptoms || !description || !duration) {
      return res.status(400).send({
        success: false,
        message: "All consultation fields are required",
      });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    if (appointment.userId.toString() !== req.userId.toString()) {
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
    if (existingConsultation) {
      return res.status(400).send({
        success: false,
        message: "Consultation already exists for this appointment",
      });
    }
    const consultation = new consultationModel({
      appointmentId,
      userId: req.userId,
      symptoms,
      description,
      duration,
    });
    await consultation.save();
    res.status(201).send({
      success: true,
      message: "Consultation saved successfully",
      data: consultation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error saving consultation",
      error: error.message,
    });
  }
};

const logHealthController = async (req, res) => {
  try {
    const { date, water, exercise, sleep, notes } = req.body;
    if (water == null || exercise == null || sleep == null) {
      return res.status(400).send({
        success: false,
        message: "Water, exercise, and sleep values are required",
      });
    }
    const plan = await healthPlanModel.findOne({
      userId: req.userId,
      status: "active",
    });
    if (!plan) {
      return res.status(400).send({
        success: false,
        message: "No active health plan found for this user",
      });
    }
    const logDate = date
      ? moment(date, "YYYY-MM-DD").startOf("day")
      : moment().startOf("day");
    const existingLog = await healthLogModel.findOne({
      userId: req.userId,
      planId: plan._id,
      date: {
        $gte: logDate.toDate(),
        $lt: moment(logDate).endOf("day").toDate(),
      },
    });
    if (existingLog) {
      existingLog.water = water;
      existingLog.exercise = exercise;
      existingLog.sleep = sleep;
      existingLog.notes = notes;
      await existingLog.save();
      return res.status(200).send({
        success: true,
        message: "Health log updated successfully",
        data: existingLog,
      });
    }
    const newLog = new healthLogModel({
      userId: req.userId,
      planId: plan._id,
      date: logDate.toDate(),
      water,
      exercise,
      sleep,
      notes,
      completed: true,
    });
    await newLog.save();
    res.status(201).send({
      success: true,
      message: "Health log saved successfully",
      data: newLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error saving health log",
      error: error.message,
    });
  }
};

const getHealthLogsController = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId.toString() !== userId.toString()) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to view these health logs",
      });
    }
    const logs = await healthLogModel.find({ userId }).sort({ date: 1 });
    res.status(200).send({
      success: true,
      message: "Health logs fetched successfully",
      data: logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching health logs",
      error: error.message,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorController,
  initiateBookingController,
  bookingAvailabilityController,
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
  userAppointmentsController,
  getAppointmentByIdController,
  addConsultationController,
  logHealthController,
  getHealthLogsController,
};

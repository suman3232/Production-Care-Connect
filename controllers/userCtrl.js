const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const { message } = require("antd");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

const registerController = async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }

    // Hash the password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
    req.body.password = hashedPassword;
    const newuser = new userModel(req.body);
    await newuser.save();

    // Log the saved user for debugging
    console.log("New user saved:", newuser);

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
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "invalid Email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userID });
    user.password = undefined;

    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    // Ensure doctor model instance creation is correct
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

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
    await userModel.findByIdAndUpdate(adminUser._id, {
      notification: adminUser.notification,
    });

    // Send success response
    res.status(201).send({
      success: true,
      message: "Doctor Applied Successfully",
    });
  } catch (error) {
    // Improved error handling
    console.error("Error while applying for doctor:", error.message);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error While Applying For Doctor",
    });
  }
};

const getallnotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = seennotification;
    const updateduser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updateduser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notififications Deleted Succesfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
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
    console.log(error),
      res.status(500).send({
        success: false,
        error,
        message: "Error While Fetching Doctors",
      });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();

    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();

    console.log("Appointment booked successfully.");
    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while booking appointment",
    });
  }
};
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromtime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const totime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromtime,
        $lte: totime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        success: true,
        message: "Appointments not available at this time",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointment Available",
      });
    }
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
      userId: req.body.userID,
    });
    console.log("Fetched appointments:", appointments);

    res.status(200).send({
      success: true,
      message: "Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting Appointments",
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
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
};

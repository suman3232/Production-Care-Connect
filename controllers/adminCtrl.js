const { message } = require("antd");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

// Fetch all users
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

// Fetch all doctors
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting doctors data",
      error,
    });
  }
};

// Change account status for doctors
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;

    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }

    const user = await userModel.findById(doctor.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const notification = user.notification;
    notification.push({
      type: "doctor-account-status-updated",
      message: `Your Doctor account request has been ${status}`,
      onClickPath:
        status === "approved" ? "/doctor-dashboard" : "/notification",
    });

    user.isDoctor = status === "approved"? true : false;
    await user.save();

    res.status(200).send({
      success: true,
      message: `Doctor account status updated to ${status}`,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in changing account status",
      error,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
};

const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");

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
      { new: true },
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

    user.notification.push({
      type: "doctor-account-status-updated",
      message: `Your Doctor account request has been ${status}`,
      onClickPath:
        status === "approved" ? "/doctor-dashboard" : "/notification",
    });

    user.isDoctor = status === "approved" ? true : false;
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

const getDashboardStatsController = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments({ isAdmin: false });
    const totalDoctors = await doctorModel.countDocuments({
      status: "approved",
    });
    const totalAppointments = await appointmentModel.countDocuments({});
    const statusDistribution = await appointmentModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      appointmentsPerDay = await appointmentModel.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $limit: 7,
        },
      ]);

    res.status(200).send({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        statusDistribution,
        appointmentsPerDay,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching dashboard stats",
      error,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  getDashboardStatsController,
};

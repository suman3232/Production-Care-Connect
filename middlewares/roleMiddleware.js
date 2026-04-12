const userModel = require("../models/userModel");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const requireDoctor = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user || !user.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor access required",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  requireAdmin,
  requireDoctor,
};

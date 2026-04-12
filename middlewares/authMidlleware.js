const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token not provided",
        success: false,
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        message: "Authorization token malformed",
        success: false,
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userID = decoded.id;
    req.body.userId = decoded.id;
    req.body.userID = decoded.id;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Auth Failed",
      success: false,
    });
  }
};

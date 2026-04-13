const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const connecDB = require("./config/db");
const path = require("path");

dotenv.config();
connecDB();

const app = express();

// CORS Configuration
// Set CORS_ORIGINS on your host as a comma-separated list, e.g.:
// CORS_ORIGINS=https://your-app.onrender.com,http://localhost:3000
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
];

const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...envAllowedOrigins, ...defaultAllowedOrigins]),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header)
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api/v1/activity", require("./routes/activityRoutes"));
app.use("/api/v1/availability", require("./routes/availabilityRoutes"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));

  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

const port = process.env.PORT || 8080;
const mode = process.env.NODE_ENV || "development";

app.listen(port, () => {
  console.log(`Server Running in ${mode} Mode on port ${port}`.bgCyan.white);
});

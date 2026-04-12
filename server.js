const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connecDB = require("./config/db");
const path = require("path");

dotenv.config();
connecDB();

const app = express();

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

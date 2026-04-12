const mongoose = require("mongoose");
const colors = require("colors");

const connecDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URL || "mongodb://127.0.0.1:27017/doctorapp";
    await mongoose.connect(mongoURI);
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb server issue: ${error}`.bgRed.white);
    process.exit(1);
  }
};

module.exports = connecDB;

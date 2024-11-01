const mongoose = require('mongoose');
const colors = require('colors');

const connecDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URL || 'mongodb+srv://sumanpatra3232:suman3232@cluster0.qlxcr.mongodb.net/doctorapp'; 
        await mongoose.connect(mongoURI);
        console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
    } catch (error) {
        console.log(`Mongodb server issue: ${error}`.bgRed.white);
    }
};

module.exports = connecDB;

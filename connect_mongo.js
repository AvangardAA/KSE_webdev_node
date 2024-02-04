// https://github.com/Yuliia-Senyk/kse-pick-student/blob/main/mongooseConnection.js sample code used

const mongoose = require('mongoose');
let dbString = 'mongodb+srv://dbkse:2tCCrgnZ79eyD5rf@cluster0.pc3wpi6.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbString);

const dbConnection = mongoose.connection;
dbConnection.on('error', () => console.error('MongoDB connection error: '));
dbConnection.once('open', () => console.log('Connected to MongoDB'));

module.exports = mongoose;
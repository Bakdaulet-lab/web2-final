// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  refreshToken: {
    type: String,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

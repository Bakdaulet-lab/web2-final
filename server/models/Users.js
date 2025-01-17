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
    min: 0,           
    max: 100,         
  },
  
});


const User = mongoose.model("User", userSchema);

module.exports = User;

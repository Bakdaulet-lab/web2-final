//userController.js
const fs = require("fs");
const path = require("path");
const User = require("./models/Users.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// userController.js
const JWT_SECRET = "Bakdaulet";

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  process.exit(1); // Exit if the secret is not defined
}


exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
};

exports.getSignPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "Signin.html"));
};

exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "Login.html"));
};

exports.getProfilePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "Profile.html"));
};



exports.registerUser = async (req, res) => {
  const { username, password, email, age } = req.body;

  if (!username || !password || !email || !age) {
    return res.status(400).json({ error: "Please enter all required fields." });
  }

  try {
    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, email, age });
    await newUser.save();


    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, username: newUser.username }, JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Set the token in a cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour




    return res.redirect("/Login.html");

  } catch (err) {
    if (err.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({ error: "Email or username already exists." });
    }
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};



exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide both username and password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Set the token in a cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    
    return res.redirect("/");

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};



// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.getUsers = (req, res) => {
  const users = readUsers(); 
  res.status(200).json(users); 
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // Get the user's ID from the URL
  const { username, email, age } = req.body; // Get the new data from the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, age },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User updated successfully.", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user's ID from the URL

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully.", deletedUser });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

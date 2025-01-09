//userController.js
const fs = require("fs");
const path = require("path");
const User = require("./models/Users.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "your_secret_key";

const bcrypt = require("bcrypt");


const usersFile = path.join(__dirname, "users.json");

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

const readUsers = () => JSON.parse(fs.readFileSync(usersFile));
const writeUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

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
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, email, age });
    await newUser.save();

    return res.redirect("/");
  } catch (err) {
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

    // Create a JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: 120000, // Token expires in 2 min
    });

    //req.session.user = { id: user._id, username: user.username };
    return res.status(200).json({
      message: "Login successful.",
      user: { username: user.username, email: user.email, age: user.age },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};



exports.getProfile = (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(401).json({ error: "Вы не авторизованы. Войдите в систему." });
  }
  const users = readUsers();
  if (!users.some((u) => u.username === username)) {
    return res.status(404).json({ error: "Пользователь не найден." });
  }
  res.status(200).json({ message: `Добро пожаловать в профиль, ${username}.` });
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

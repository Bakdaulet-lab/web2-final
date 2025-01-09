const express = require("express");
const {
  getHomePage,
  getSignPage,
  getLoginPage,
  getProfilePage,
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  updateUser, 
  deleteUser, 
} = require("./userController");
const authenticate = require("./middlewares/auth");

const router = express.Router();






router.get("/", getHomePage);
router.get("/sign", getSignPage);
router.get("/login", getLoginPage);


router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require JWT authentication)
router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, getUsers);
router.put("/users/:id", authenticate, updateUser);
router.delete("/users/:id", authenticate, deleteUser);

module.exports = router;

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


const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized access." });
  }
  next();
};

router.get("/profile", authenticateSession, getProfilePage);



router.get("/", getHomePage);

router.get("/sign", getSignPage);
router.get("/login", getLoginPage);

router.get("/profile", authenticate, getProfilePage);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getProfile);
router.get("/users", getUsers);
router.put("/users/:id", updateUser); 
router.delete("/users/:id", deleteUser); 

module.exports = router;

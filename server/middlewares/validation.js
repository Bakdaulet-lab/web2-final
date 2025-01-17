const { check, validationResult } = require("express-validator");

// User Registration Validation
exports.validateRegister = [
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("age")
    .optional()
    .isNumeric()
    .withMessage("Age must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// User Login Validation
exports.validateLogin = [
  check("username").trim().notEmpty().withMessage("Username is required"),
  check("password").trim().notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

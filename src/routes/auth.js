const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const user = new User({ username, password, role: role || "user" });
  await user.save();
  res.status(201).json({ message: "User created successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ accessToken, refreshToken });
});

// Refresh Token
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Token not provided" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Middleware to protect routes based on user role
const protect = (role = "user") => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (role && req.user.role !== role) {
        return res.status(403).json({ message: "Forbidden: Access is denied" });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Not authorized" });
    }
  };
};

module.exports = { router, protect };

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const User = mongoose.models.User || mongoose.model("User");
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "This account no longer exists.",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("AUTH ERROR: Token Expired");
    } else {
      console.log("❌ AUTH ERROR:", error.message);
    }

    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please login again.",
    });
  }
};

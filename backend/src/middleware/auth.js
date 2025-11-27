const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      const userResult = await db.query(
        `SELECT u.id, u.username, u.email, r.name as role, u.is_active
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = $1`,
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return res.status(403).json({
          success: false,
          message: "User not found or inactive",
        });
      }

      req.user = userResult.rows[0];
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

const isAdmin = authorizeRoles("admin");
const isAdminOrAdvanced = authorizeRoles("admin", "advanced_user");
const isAuthenticated = authenticateToken;

module.exports = {
  authenticateToken,
  authorizeRoles,
  isAdmin,
  isAdminOrAdvanced,
  isAuthenticated,
};

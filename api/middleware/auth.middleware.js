import jwt from "jsonwebtoken";
import User from "../services/auth/models/User.js";
import Admin from "../services/auth/models/Admin.js";

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "royal_matka_super_secret_jwt_key_1008";

/**
 * Verify JWT Token for general authenticated requests
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["authorization"] || req.headers["x-access-token"];
    const token = authHeader && authHeader.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Authentication token missing."
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again."
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify Admin Role for Admin Panel routes
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["authorization"] || req.headers["x-access-token"];
    const token = authHeader && authHeader.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Admin authentication token missing."
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRole = String(decoded.role || "").toLowerCase();
      const isAdminRole = userRole === "admin" || userRole === "super admin" || userRole === "sub admin" || userRole === "operator" || decoded.isAdmin === true;

      if (isAdminRole) {
        req.user = decoded;
        return next();
      }

      // Check DB if admin exists
      if (decoded.id || decoded._id || decoded.mobile) {
        const dbAdmin = await Admin.findOne({
          $or: [
            { _id: decoded.id || decoded._id },
            { mobile: decoded.mobile }
          ]
        });
        if (dbAdmin && dbAdmin.status !== "Blocked") {
          req.user = {
            id: dbAdmin._id,
            _id: dbAdmin._id,
            name: dbAdmin.name,
            role: dbAdmin.role || "Admin",
            isAdmin: true,
            email: dbAdmin.email,
            mobile: dbAdmin.mobile
          };
          return next();
        }

        const dbUser = await User.findOne({
          $or: [
            { _id: decoded.id || decoded._id },
            { mobile: decoded.mobile }
          ]
        });
        if (dbUser && (String(dbUser.role).toLowerCase() === "admin" || dbUser.isAdmin === true)) {
          req.user = {
            id: dbUser._id,
            _id: dbUser._id,
            name: dbUser.name,
            role: dbUser.role || "Admin",
            isAdmin: true,
            email: dbUser.email,
            mobile: dbUser.mobile
          };
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: "Access Denied. Admin privileges required."
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin session token. Please log in again."
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

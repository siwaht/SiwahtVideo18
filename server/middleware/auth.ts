import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Admin authentication middleware
const ADMIN_USER = process.env.ADMIN_USER || "cc@siwaht.com";
const ADMIN_PASS = process.env.ADMIN_PASS || "Hola173!";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_production";

interface AuthRequest extends Request {
  admin?: { username: string };
}

// Login handler
export const adminLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Check credentials
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Create JWT token
    const token = jwt.sign(
      { username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
};

// Logout handler
export const adminLogout = async (req: Request, res: Response) => {
  res.clearCookie("adminToken");
  return res.json({ success: true, message: "Logout successful" });
};

// Authentication middleware
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Check auth status
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.adminToken;
    
    if (!token) {
      return res.json({ authenticated: false });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true });
  } catch (error) {
    return res.json({ authenticated: false });
  }
};
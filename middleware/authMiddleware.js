import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req,res,next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({success:false,message:"Not authorized. Token missing."});
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({success:false,message:"User no longer exists."});
    req.user = user;
    next();
  } catch {
    return res.status(401).json({success:false,message:"Invalid or expired token."});
  }
};

export const officerOnly = (req,res,next) => {
  if (req.user?.role !== "officer") {
    return res.status(403).json({success:false,message:"Officer access only."});
  }
  next();
};

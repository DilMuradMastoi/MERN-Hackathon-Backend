import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"7d"});

export const signup = async (req,res) => {
  try {
    const {name,email,password,role} = req.body;
    if (!name || !email || !password)
      return res.status(400).json({success:false,message:"Please provide name, email and password."});

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({email:normalizedEmail});
    if (existing) return res.status(400).json({success:false,message:"Email already registered."});

    const hashed = await bcrypt.hash(password,10);
    const user = await User.create({
      name:name.trim(),
      email:normalizedEmail,
      password:hashed,
      role:role === "officer" ? "officer" : "citizen"
    });

    res.status(201).json({
      success:true,message:"Account created successfully.",
      user:{id:user._id,name:user.name,email:user.email,role:user.role},
      token:generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const login = async (req,res) => {
  try {
    const {email,password} = req.body;
    if (!email || !password)
      return res.status(400).json({success:false,message:"Please provide email and password."});

    const user = await User.findOne({email:email.trim().toLowerCase()});
    if (!user) return res.status(401).json({success:false,message:"Invalid email or password."});

    const match = await bcrypt.compare(password,user.password);
    if (!match) return res.status(401).json({success:false,message:"Invalid email or password."});

    res.json({
      success:true,message:"Login successful.",
      token:generateToken(user._id),
      user:{id:user._id,name:user.name,email:user.email,role:user.role}
    });
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

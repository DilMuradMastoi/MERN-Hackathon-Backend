import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";

dotenv.config();
await connectDB();

const app = express();
app.use(cors());
app.use(express.json({limit:"2mb"}));

app.get("/api/health",(req,res)=>res.json({
  success:true,
  message:"CivicResolve API is running.",
  geminiEnabled:Boolean(process.env.GEMINI_API_KEY)
}));

app.use("/api/auth",authRoutes);
app.use("/api/complaints",complaintRoutes);
app.use("/api/ai",aiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`CivicResolve API running on port ${PORT}`));



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// Connect to Database
await connectDB();

const app = express();

// Enable CORS for frontend domain
app.use(
  cors({
    origin: [
      "https://mern-hackathon-frontend.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));

// Health Check Route
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    message: "CivicResolve API is running.",
  })
);

// Routes (removed aiRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Local development listener
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`CivicResolve API running on port ${PORT}`));
// }

// Export for Vercel Serverless Functions
export default app;
import express from "express";
import {
  createComplaint,getComplaints,getMyComplaints,getComplaintById,
  upvoteComplaint,updateComplaintStatus,giveFeedback,exportComplaints
} from "../controllers/complaintController.js";
import {protect,officerOnly} from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific routes before /:id
router.get("/mine",protect,getMyComplaints);
router.get("/export",protect,officerOnly,exportComplaints);
router.post("/",protect,createComplaint);
router.get("/",getComplaints);
router.get("/:id",getComplaintById);
router.patch("/:id/upvote",protect,upvoteComplaint);
router.patch("/:id/status",protect,officerOnly,updateComplaintStatus);
router.patch("/:id/feedback",protect,giveFeedback);
export default router;

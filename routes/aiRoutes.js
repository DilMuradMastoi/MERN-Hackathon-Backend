import express from "express";
import {getOfficerSummary} from "../controllers/aiController.js";
import {protect,officerOnly} from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/officer-summary",protect,officerOnly,getOfficerSummary);
export default router;

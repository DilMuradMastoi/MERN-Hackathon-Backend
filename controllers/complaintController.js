import Complaint from "../models/Complaint.js";
import {calculatePriority} from "../utils/priority.js";
import {Parser} from "json2csv";

const withPriority = (complaint) => {
  const data = complaint.toObject();
  const {score,priority} = calculatePriority(complaint.upvotes,complaint.createdAt);
  data.priority = priority;
  data.priorityScore = score;
  return data;
};

export const createComplaint = async (req,res) => {
  try {
    const {title,description,category,area,imageUrl} = req.body;
    if (!title || !description || !category || !area)
      return res.status(400).json({success:false,message:"All required fields must be provided."});

    const complaint = await Complaint.create({
      title:title.trim(),description,category,area:area.trim(),imageUrl:imageUrl || "",
      createdBy:req.user._id
    });
    res.status(201).json({success:true,message:"Complaint submitted successfully.",complaint:withPriority(complaint)});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const getComplaints = async (req,res) => {
  try {
    const {search,category,status,area,priority} = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (area) query.area = {$regex:area,$options:"i"};
    if (search) query.$or = [
      {title:{$regex:search,$options:"i"}},
      {description:{$regex:search,$options:"i"}}
    ];

    let complaints = await Complaint.find(query)
      .populate("createdBy","name email")
      .sort({createdAt:-1});

    complaints = complaints.map(withPriority);
    if (priority) complaints = complaints.filter(c => c.priority === priority);

    res.json({success:true,count:complaints.length,complaints});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const getMyComplaints = async (req,res) => {
  try {
    const complaints = await Complaint.find({createdBy:req.user._id}).sort({createdAt:-1});
    res.json({success:true,count:complaints.length,complaints:complaints.map(withPriority)});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const getComplaintById = async (req,res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("createdBy","name email");
    if (!complaint) return res.status(404).json({success:false,message:"Complaint not found."});
    res.json({success:true,complaint:withPriority(complaint)});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const upvoteComplaint = async (req,res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id, {$inc:{upvotes:1}}, {new:true,runValidators:true}
    );
    if (!complaint) return res.status(404).json({success:false,message:"Complaint not found."});
    res.json({success:true,message:"Complaint upvoted.",upvotes:complaint.upvotes});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const updateComplaintStatus = async (req,res) => {
  try {
    const {status,officerRemark} = req.body;
    const valid = ["Pending","In Progress","Resolved"];
    if (!valid.includes(status))
      return res.status(400).json({success:false,message:"Invalid status. Use Pending, In Progress, or Resolved."});

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({success:false,message:"Complaint not found."});

    complaint.status = status;
    if (officerRemark !== undefined) complaint.officerRemark = String(officerRemark);
    complaint.feedbackPending = status === "Resolved";
    if (status !== "Resolved") {
      complaint.feedbackPending = false;
    }
    await complaint.save();

    const updated = await Complaint.findById(complaint._id).populate("createdBy","name email");
    res.json({success:true,message:"Complaint updated successfully.",complaint:withPriority(updated)});
  } catch (error) {
    console.error("STATUS UPDATE ERROR:",error);
    res.status(500).json({success:false,message:error.message});
  }
};

export const giveFeedback = async (req,res) => {
  try {
    const {rating,comment} = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5)
      return res.status(400).json({success:false,message:"Rating must be an integer from 1 to 5."});

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({success:false,message:"Complaint not found."});
    if (String(complaint.createdBy) !== String(req.user._id))
      return res.status(403).json({success:false,message:"You can only review your own complaint."});
    if (complaint.status !== "Resolved")
      return res.status(400).json({success:false,message:"Complaint is not resolved yet."});

    complaint.feedbackRating = numericRating;
    complaint.feedbackComment = comment || "";
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;
    await complaint.save();

    res.json({success:true,message:"Feedback submitted successfully.",complaint:withPriority(complaint)});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

export const exportComplaints = async (req,res) => {
  try {
    const complaints = await Complaint.find().populate("createdBy","name email").sort({createdAt:-1});
    const rows = complaints.map(c => {
      const {priority} = calculatePriority(c.upvotes,c.createdAt);
      return {
        ID:String(c._id),Title:c.title,Category:c.category,Area:c.area,Status:c.status,
        Priority:priority,Upvotes:c.upvotes,"Filed By":c.createdBy?.name || "Unknown",
        "Filed On":c.createdAt,"Last Updated":c.updatedAt,"Officer Remark":c.officerRemark
      };
    });
    const csv = new Parser().parse(rows);
    res.header("Content-Type","text/csv");
    res.attachment(`complaints_export_${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

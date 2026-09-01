import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  description:{type:String,required:true},
  category:{type:String,enum:["Road","Garbage","Water","Electricity","Other"],required:true},
  area:{type:String,required:true,trim:true},
  status:{type:String,enum:["Pending","In Progress","Resolved"],default:"Pending"},
  upvotes:{type:Number,default:0},
  imageUrl:{type:String,default:""},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  officerRemark:{type:String,default:""},
  priority:{type:String,default:"Low"},
  feedbackRating:{type:Number,min:1,max:5,default:null},
  feedbackComment:{type:String,default:""},
  feedbackGiven:{type:Boolean,default:false},
  feedbackPending:{type:Boolean,default:false}
},{timestamps:true});

export default mongoose.model("Complaint",complaintSchema);

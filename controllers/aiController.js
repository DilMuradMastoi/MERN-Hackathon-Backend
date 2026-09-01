import Complaint from "../models/Complaint.js";

export const getOfficerSummary = async (req,res) => {
  try {
    const complaints = await Complaint.find();
    const stats = {
      total:complaints.length,
      pending:complaints.filter(c=>c.status==="Pending").length,
      inProgress:complaints.filter(c=>c.status==="In Progress").length,
      resolved:complaints.filter(c=>c.status==="Resolved").length
    };

    // Gemini is optional. Return a useful non-AI briefing when no key is configured.
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success:true,
        summary:`There are ${stats.total} complaints: ${stats.pending} pending, ${stats.inProgress} in progress, and ${stats.resolved} resolved. Review pending complaints first and keep in-progress cases updated.`,
        stats,
        aiEnabled:false
      });
    }

    try {
      const {GoogleGenerativeAI} = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"});
      const prompt = `You are a government operations assistant. Create a concise officer briefing in 3 to 5 sentences. Complaint statistics: ${JSON.stringify(stats)}. Explain which complaints need attention.`;
      const result = await model.generateContent(prompt);
      return res.json({success:true,summary:result.response.text(),stats,aiEnabled:true});
    } catch (aiError) {
      console.error("Gemini briefing failed:",aiError.message);
      return res.json({
        success:true,
        summary:`There are ${stats.total} complaints: ${stats.pending} pending, ${stats.inProgress} in progress, and ${stats.resolved} resolved. Gemini is unavailable, but complaint management is working normally.`,
        stats,
        aiEnabled:false
      });
    }
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

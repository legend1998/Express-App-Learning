import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now() },
  desc: { type: String, required: true },
  user_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
});

export default mongoose.model("activities", activitySchema);

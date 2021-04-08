import mongoose from "mongoose";

const transSchema = new mongoose.Schema({
  type: { type: String, enum: ["cr", "dr"], required: true },
  amount: { type: Number, required: true },
  datetime: { type: Date, default: Date.now() },
  user_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
});

export default mongoose.model("transactions", transSchema);

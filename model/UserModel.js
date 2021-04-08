import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: {
    type: Number,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },
  status: { type: Boolean, default: true },
  withdrawToday: { type: Boolean, default: false },
  password: { type: String, required: true },
  refBy: { type: String, default: "" },
  refCode: { type: String, unique: true },
  Address: { type: Object },
  aadhar: { type: Number, unique: true, minlength: 12, maxlength: 12 },
  multiple: { type: Number, default: 1 },
  wallet: {
    balance: { type: Number, Default: 0 },
    ROI: { type: Number, Default: 1.7 },
  },
  principle: {
    balance: { type: Number, default: 0 },
    freeze: { type: Boolean, default: false },
    cycle: { type: Number, default: 7 },
  },
});

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;

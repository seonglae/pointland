import mongoose from "mongoose"

export default new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    role: { type: String, required: true }
  },
  { _id: false }
)

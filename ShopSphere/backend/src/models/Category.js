import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);

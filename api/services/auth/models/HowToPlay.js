import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  id: { type: Number, default: () => Date.now() },
  title: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  instructions: { type: String, default: "" },
  files: { type: Array, default: [] }
});

const howToPlaySchema = new mongoose.Schema(
  {
    title: { type: String, default: "How to Play" },
    sections: [sectionSchema]
  },
  { timestamps: true }
);

export const HowToPlay = mongoose.model("HowToPlay", howToPlaySchema);
export default HowToPlay;

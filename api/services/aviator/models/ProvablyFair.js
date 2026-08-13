import mongoose from "mongoose";

const ProvablyFairSchema = new mongoose.Schema(
  {
    roundId: {
      type: String,
      index: true,
    },

    serverSeed: String,

    serverSeedHash: String,

    clientSeed: String,

    nonce: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ProvablyFair", ProvablyFairSchema);
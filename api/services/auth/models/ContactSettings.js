import mongoose from "mongoose";

const contactSettingsSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, default: "+91 9999999999" },
    telegram: { type: String, default: "https://t.me/sanwariyaboss_support" },
    phone1: { type: String, default: "9999999999" },
    phone2: { type: String, default: "" },
    email: { type: String, default: "support@sanwariyaboss.fun" },
    address: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ContactSettings = mongoose.model("ContactSettings", contactSettingsSchema);
export default ContactSettings;

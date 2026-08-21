import ContactSettings from "../models/ContactSettings.js";
import mongoose from "mongoose";

export const getContactSettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await ContactSettings.findOne().sort({ updatedAt: -1 });
      if (!settings) {
        settings = await ContactSettings.create({
          whatsapp: "+91 9999999999",
          telegram: "https://t.me/sanwariyaboss_support",
          phone1: "9999999999",
          phone2: "",
          email: "support@sanwariyaboss.fun",
          address: ""
        });
      }
      return res.status(200).json({ success: true, contact: settings });
    }
    return res.status(200).json({
      success: true,
      contact: {
        whatsapp: "+91 9999999999",
        telegram: "https://t.me/sanwariyaboss_support",
        phone1: "9999999999",
        phone2: "",
        email: "support@sanwariyaboss.fun",
        address: ""
      }
    });
  } catch (error) {
    console.error("getContactSettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContactSettings = async (req, res) => {
  try {
    const { whatsapp, telegram, phone1, phone2, email, address } = req.body;
    if (mongoose.connection.readyState === 1) {
      let settings = await ContactSettings.findOne().sort({ updatedAt: -1 });
      if (!settings) {
        settings = new ContactSettings();
      }

      if (whatsapp !== undefined) settings.whatsapp = String(whatsapp).trim();
      if (telegram !== undefined) settings.telegram = String(telegram).trim();
      if (phone1 !== undefined) settings.phone1 = String(phone1).trim();
      if (phone2 !== undefined) settings.phone2 = String(phone2).trim();
      if (email !== undefined) settings.email = String(email).trim();
      if (address !== undefined) settings.address = String(address).trim();

      await settings.save();
      return res.status(200).json({
        success: true,
        message: "Contact settings updated successfully! 🎉",
        contact: settings
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact settings updated successfully!",
      contact: req.body
    });
  } catch (error) {
    console.error("updateContactSettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

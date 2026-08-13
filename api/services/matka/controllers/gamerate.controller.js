import GameRate from "../models/GameRate.js";
import mongoose from "mongoose";

const DEFAULT_RATES = [
  // Main Pana
  { name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Main Pana', starred: false, active: true },
  { name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Main Pana', starred: true, active: true },
  { name: 'Single Panna', desc: 'Three digit single panna', value: '1 ka 160', category: 'Main Pana', starred: false, active: true },
  { name: 'Double Panna', desc: 'Three digit double panna', value: '1 ka 320', category: 'Main Pana', starred: false, active: true },
  { name: 'Triple Panna', desc: 'Three digit triple panna', value: '1 ka 800', category: 'Main Pana', starred: false, active: true },
  { name: 'Half Sangam', desc: 'Half sangam combination', value: '1 ka 1000', category: 'Main Pana', starred: false, active: true },
  { name: 'Full Sangam', desc: 'Full sangam combination', value: '1 ka 10000', category: 'Main Pana', starred: false, active: true },

  // Starline
  { name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Starline', starred: false, active: true },
  { name: 'Single Panna', desc: 'Three digit single panna', value: '1 ka 160', category: 'Starline', starred: false, active: true },
  { name: 'Double Panna', desc: 'Three digit double panna', value: '1 ka 320', category: 'Starline', starred: false, active: true },
  { name: 'Triple Panna', desc: 'Three digit triple panna', value: '1 ka 800', category: 'Starline', starred: true, active: true },

  // Gali / Disawar
  { name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Gali / Disawar', starred: true, active: true },
  { name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Gali / Disawar', starred: false, active: true },

  // Jackpot
  { name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Jackpot', starred: false, active: true }
];

export const getGameRates = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let rates = await GameRate.find().sort({ createdAt: 1 });
      if (!rates || rates.length === 0) {
        rates = await GameRate.insertMany(DEFAULT_RATES);
      }
      return res.status(200).json({ success: true, data: rates });
    }
    return res.status(200).json({ success: true, data: DEFAULT_RATES });
  } catch (error) {
    return res.status(200).json({ success: true, data: DEFAULT_RATES });
  }
};

export const updateGameRate = async (req, res) => {
  try {
    const { id, name, desc, value, category, starred, active } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Rate ID is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const rate = await GameRate.findById(id);
      if (!rate) {
        return res.status(404).json({ success: false, message: "Game rate not found" });
      }

      if (name !== undefined) rate.name = String(name).trim();
      if (desc !== undefined) rate.desc = String(desc).trim();
      if (value !== undefined) rate.value = String(value).trim();
      if (category !== undefined) rate.category = category;
      if (starred !== undefined) rate.starred = Boolean(starred);
      if (active !== undefined) rate.active = Boolean(active);

      await rate.save();
      return res.status(200).json({ success: true, message: "Game rate updated successfully! 🎉", data: rate });
    }

    return res.status(200).json({ success: true, message: "Game rate updated (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addGameRate = async (req, res) => {
  try {
    const { name, desc, value, category } = req.body;
    if (!name || !value) {
      return res.status(400).json({ success: false, message: "Name and payout value are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const newRate = await GameRate.create({
        name: String(name).trim(),
        desc: desc ? String(desc).trim() : "",
        value: String(value).trim(),
        category: category || "Main Pana"
      });
      return res.status(201).json({ success: true, message: "Game rate added successfully! 🎉", data: newRate });
    }

    return res.status(200).json({ success: true, message: "Game rate added (Demo mode)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGameRate = async (req, res) => {
  try {
    const { id } = req.query;
    if (mongoose.connection.readyState === 1 && id) {
      await GameRate.findByIdAndDelete(id);
    }
    return res.status(200).json({ success: true, message: "Game rate deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

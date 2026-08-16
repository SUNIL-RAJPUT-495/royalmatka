import HowToPlay from "../models/HowToPlay.js";
import mongoose from "mongoose";

export const getHowToPlaySettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let doc = await HowToPlay.findOne().sort({ updatedAt: -1 });
      if (!doc) {
        doc = await HowToPlay.create({
          title: "How to Play",
          sections: [
            {
              id: Date.now(),
              title: "Introduction",
              videoUrl: "https://www.youtube.com/watch?v=example",
              instructions: "Welcome to our platform. Follow these simple steps to learn how to place bids and check game results.",
              files: []
            }
          ]
        });
      }
      return res.status(200).json({ success: true, title: doc.title, sections: doc.sections, data: doc });
    }
    return res.status(200).json({
      success: true,
      title: "How to Play",
      sections: [
        {
          id: 1,
          title: "Introduction",
          videoUrl: "https://www.youtube.com/watch?v=example",
          instructions: "Welcome to our platform. Follow these simple steps to learn how to place bids and check game results.",
          files: []
        }
      ]
    });
  } catch (error) {
    console.error("getHowToPlaySettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHowToPlaySettings = async (req, res) => {
  try {
    const { title, sections } = req.body;
    if (mongoose.connection.readyState === 1) {
      let doc = await HowToPlay.findOne().sort({ updatedAt: -1 });
      if (!doc) {
        doc = new HowToPlay();
      }

      if (title !== undefined) doc.title = String(title).trim();
      if (Array.isArray(sections)) doc.sections = sections;

      await doc.save();
      return res.status(200).json({
        success: true,
        message: "How To Play content saved successfully! 🎉",
        title: doc.title,
        sections: doc.sections
      });
    }

    return res.status(200).json({
      success: true,
      message: "How To Play content saved successfully!",
      title: title || "How to Play",
      sections: sections || []
    });
  } catch (error) {
    console.error("updateHowToPlaySettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

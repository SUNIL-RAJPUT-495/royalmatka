import ChatMessage from "../models/ChatMessage.js";
import User from "../../auth/models/User.js";

/**
 * GET /api/chat/admin/threads
 * Fetch list of all user threads with latest message & unread counts
 */
export const getAdminThreads = async (req, res) => {
  try {
    // Find all distinct userIds that have messages in ChatMessage collection
    const activeUserIds = await ChatMessage.distinct("userId");

    if (!activeUserIds || activeUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        threads: []
      });
    }

    const users = await User.find({ _id: { $in: activeUserIds }, role: { $ne: "Admin" } })
      .select("name mobile balance status createdAt")
      .lean();

    const threads = await Promise.all(
      users.map(async (user) => {
        const lastMsg = await ChatMessage.findOne({ userId: user._id })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await ChatMessage.countDocuments({
          userId: user._id,
          sender: "user",
          readByAdmin: false
        });

        const totalMessages = await ChatMessage.countDocuments({
          userId: user._id
        });

        return {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name || "User",
          mobile: user.mobile || "",
          balance: user.balance || 0,
          status: user.status || "Active",
          createdAt: user.createdAt,
          lastMessage: lastMsg ? lastMsg.text : "",
          lastMessageSender: lastMsg ? lastMsg.sender : "",
          lastMessageTime: lastMsg ? lastMsg.createdAt : user.createdAt,
          unreadCount,
          totalMessages
        };
      })
    );

    // Filter threads to ensure totalMessages > 0
    const activeThreads = threads.filter(t => t.totalMessages > 0);

    // Sort threads: ones with unread messages first, then by last message time
    activeThreads.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json({
      success: true,
      threads: activeThreads
    });
  } catch (error) {
    console.error("Error in getAdminThreads:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch chat threads"
    });
  }
};

/**
 * GET /api/chat/admin/messages/:userId
 * Fetch full chat history for a given user & mark messages as read by admin
 */
export const getAdminMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId).select("name mobile balance status createdAt").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Mark user messages as read by admin
    await ChatMessage.updateMany(
      { userId, sender: "user", readByAdmin: false },
      { $set: { readByAdmin: true } }
    );

    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      user,
      messages
    });
  } catch (error) {
    console.error("Error in getAdminMessages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages"
    });
  }
};

/**
 * POST /api/chat/admin/send
 * Admin sends a message to a user
 */
export const sendAdminMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID and message text are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newMessage = await ChatMessage.create({
      userId,
      sender: "admin",
      senderName: "Admin",
      text: text.trim(),
      readByAdmin: true,
      readByUser: false
    });

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Error in sendAdminMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message"
    });
  }
};

/**
 * GET /api/chat/user/messages
 * User fetches their own chat history with admin
 */
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId || (req.user ? req.user.id : null);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Mark admin messages as read by user
    await ChatMessage.updateMany(
      { userId, sender: "admin", readByUser: false },
      { $set: { readByUser: true } }
    );

    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error in getUserMessages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user messages"
    });
  }
};

/**
 * POST /api/chat/user/send
 * User sends a message to admin
 */
export const sendUserMessage = async (req, res) => {
  try {
    const { userId, text, senderName } = req.body;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID and message text are required"
      });
    }

    const newMessage = await ChatMessage.create({
      userId,
      sender: "user",
      senderName: senderName || "User",
      text: text.trim(),
      readByUser: true,
      readByAdmin: false
    });

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Error in sendUserMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message"
    });
  }
};

/**
 * DELETE /api/chat/admin/clear/:userId
 * Clear entire chat history with a user
 */
export const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    await ChatMessage.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully"
    });
  } catch (error) {
    console.error("Error in clearChat:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear chat"
    });
  }
};

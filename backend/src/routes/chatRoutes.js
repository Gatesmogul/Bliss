const express = require('express');
const router = express.Router();
const { protect, isVerified } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Match = require('../models/Match');

/**
 * Chat & Messaging Routes
 * Base Path: /api/chats
 */

// @desc    Get all messages for a specific match
// @route   GET /api/chats/:matchId
// @access  Private
router.get('/:matchId', protect, async (req, res) => {
  try {
    const { matchId } = req.params;

    // 1. Verify the match exists and the user is part of it
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      status: 'active'
    });

    if (!match) {
      return res.status(404).json({ message: "Conversation not found or access denied" });
    }

    // 2. Fetch messages ordered by time
    const messages = await Message.find({ match: matchId })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName profileImage');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// @desc    Send a new message
// @route   POST /api/chats/:matchId
// @access  Private
router.post('/:matchId', protect, isVerified, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content, messageType, mediaUrl } = req.body;

    // 1. Ensure the user is part of an active match
    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id,
      status: 'active'
    });

    if (!match) {
      return res.status(403).json({ message: "Cannot send message to this connection" });
    }

    // 2. Create the message
    const newMessage = await Message.create({
      match: matchId,
      sender: req.user._id,
      content,
      messageType: messageType || 'text',
      mediaUrl
    });

    // 3. Update the Match model's lastMessage for the Chat List preview
    match.lastMessage = newMessage._id;
    await match.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
});

module.exports = router;
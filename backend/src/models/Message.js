import mongoose from 'mongoose';

/**
 * Message Model
 * Handles individual chat interactions within a Match.
 */
const messageSchema = new mongoose.Schema(
  {
    // The specific conversation this message belongs to
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    // The user who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Content of the message
    content: {
      type: String,
      required: function() { return this.messageType === 'text'; }
    },
    // Support for different media types (Text, Image, Video)
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'voice'],
      default: 'text',
    },
    // URL for media if the type is not text
    mediaUrl: {
      type: String,
    },
    // Status tracking for the specific message
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
  },
  {
    timestamps: true, // Captures 'createdAt' for message timing
  }
);

/**
 * Indexes for High Performance
 * 1. Finding all messages in a match (ordered by time)
 * 2. Finding messages by sender
 */
messageSchema.index({ match: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
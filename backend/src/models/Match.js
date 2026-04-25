import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    // The two users involved in the match
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // The user who triggered the match (e.g., the one who swiped last)
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'unmatched'],
      default: 'active',
    },
    // Tracks who performed the block to allow them to unblock later
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Tracks the last time each user viewed the chat
    readReceipts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastReadAt: { type: Date, default: Date.now },
      }
    ],
    // Reference to the most recent message for the "Inbox" preview
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
    // This ensures that when you send data to the frontend, 
    // it includes virtuals like 'id' instead of just '_id'
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * INDEXES
 * Speeds up queries when searching for matches involving a specific user.
 */
matchSchema.index({ users: 1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;
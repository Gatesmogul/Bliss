const User = require('../models/User');

/**
 * @desc    Get discovery feed (Verified users, same country, opposite gender)
 * @route   GET /api/matches/discovery
 * @access  Private
 */
exports.getDiscoveryFeed = async (req, res) => {
  try {
    const currentUser = req.user;

    // Logic: Find users who:
    // 1. Are in the same country
    // 2. Have a different gender
    // 3. Are verified
    // 4. Are not the current user themselves
    const users = await User.find({
      country: currentUser.country,
      gender: { $ne: currentUser.gender },
      isVerified: true,
      _id: { $ne: currentUser._id },
      // Optional: Exclude users already connected
      connections: { $nin: [currentUser._id] }
    })
    .select('fullName age country profession profileImage isVerified about')
    .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discovery feed', error: error.message });
  }
};

/**
 * @desc    Send a connection request
 * @route   POST /api/matches/connect/:id
 * @access  Private
 */
exports.sendConnectionRequest = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const senderId = req.user._id;

    if (targetUserId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already exists
    const alreadyRequested = targetUser.connectionRequests.some(
      (req) => req.from.toString() === senderId.toString()
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: "Connection request already pending" });
    }

    // Add to target user's requests
    targetUser.connectionRequests.push({ from: senderId, status: 'pending' });
    await targetUser.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Error sending request', error: error.message });
  }
};

/**
 * @desc    Accept or Reject a connection request
 * @route   PUT /api/matches/respond/:requestId
 * @access  Private
 */
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const currentUser = await User.findById(req.user._id);
    
    // Find the specific request in the user's array
    const requestIndex = currentUser.connectionRequests.findIndex(
      (r) => r._id.toString() === req.params.requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = currentUser.connectionRequests[requestIndex];

    if (action === 'accept') {
      // 1. Add both users to each other's connections list
      currentUser.connections.push(request.from);
      
      const sender = await User.findById(request.from);
      sender.connections.push(currentUser._id);
      
      await sender.save();
      
      // 2. Remove the request
      currentUser.connectionRequests.splice(requestIndex, 1);
      await currentUser.save();

      return res.status(200).json({ message: "Connection established!" });
    } else {
      // Just remove the request if rejected
      currentUser.connectionRequests.splice(requestIndex, 1);
      await currentUser.save();
      
      return res.status(200).json({ message: "Request declined" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error responding to request', error: error.message });
  }
};
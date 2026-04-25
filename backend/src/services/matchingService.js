const User = require('../models/User');
const Match = require('../models/Match');

/**
 * Matching Service
 * Handles the logic for finding potential partners and calculating compatibility.
 */

/**
 * Get Potential Matches
 * Advanced filtering based on location, gender, verification, and block lists.
 */
exports.getDiscoveryCandidates = async (userId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) throw new Error('User not found');

    // 1. Get IDs of users to exclude (Already connected or Blocked)
    const existingMatches = await Match.find({
      users: userId,
    }).select('users status');

    const excludedUserIds = [userId]; // Always exclude self

    existingMatches.forEach((match) => {
      const otherUser = match.users.find((id) => id.toString() !== userId.toString());
      if (otherUser) {
        // Exclude if already matched, pending, or blocked
        excludedUserIds.push(otherUser);
      }
    });

    // 2. Fetch Candidates
    // Logic: Same country, opposite gender, verified, not in exclusion list
    const candidates = await User.find({
      _id: { $nin: excludedUserIds },
      country: currentUser.country,
      gender: { $ne: currentUser.gender },
      isVerified: true,
      isEmailVerified: true, // Only show users who confirmed their email
    })
      .select('fullName age country profession profileImage religion about interestTags')
      .limit(40)
      .lean(); // Use lean() for faster read-only performance

    // 3. Optional: Sort candidates by "Compatibility Score"
    return candidates.map(candidate => ({
      ...candidate,
      compatibilityScore: calculateCompatibility(currentUser, candidate)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  } catch (error) {
    console.error('Matching Service Error:', error);
    throw error;
  }
};

/**
 * Calculate Compatibility Score
 * Simple algorithm based on shared interests or proximity.
 */
const calculateCompatibility = (userA, userB) => {
  let score = 50; // Base score

  // Boost score for shared profession
  if (userA.profession === userB.profession) score += 15;

  // Boost score for shared religion
  if (userA.religion === userB.religion) score += 10;

  // Future logic: Shared interests/tags
  if (userA.interestTags && userB.interestTags) {
    const shared = userA.interestTags.filter(tag => userB.interestTags.includes(tag));
    score += (shared.length * 5);
  }

  return Math.min(score, 99); // Cap at 99%
};
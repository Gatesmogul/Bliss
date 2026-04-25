import Match from '../models/Match.js';
import User from '../models/User.js';

/**
 * Matching Service
 * Handles the logic for finding potential partners and calculating compatibility.
 */

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

  // Shared interests/tags logic
  if (userA.interestTags && userB.interestTags) {
    const shared = userA.interestTags.filter(tag => userB.interestTags.includes(tag));
    score += (shared.length * 5);
  }

  return Math.min(score, 99); // Cap at 99%
};

/**
 * Get Potential Matches
 * Advanced filtering based on location, gender, verification, and block lists.
 */
export const getDiscoveryCandidates = async (userId) => {
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
      isEmailVerified: true,
    })
      .select('fullName age country profession profileImage religion about interestTags')
      .limit(40)
      .lean();

    // 3. Return candidates with compatibility score
    return candidates.map(candidate => ({
      ...candidate,
      compatibilityScore: calculateCompatibility(currentUser, candidate)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  } catch (error) {
    console.error('Matching Service Error:', error);
    throw error;
  }
};

// Export as a default object for easy service-wide access
export default {
  getDiscoveryCandidates,
  calculateCompatibility
};
import matchingService from '../../../../BLISS/backend/src/services/matchingService.js';

/**
 * @desc    Get potential matches for the user
 * @route   GET /api/matches/discovery
 * @access  Private
 */
export const getDiscoveryFeed = async (req, res) => {
  try {
    const candidates = await matchingService.getDiscoveryCandidates(req.user._id);
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ 
      message: 'Matching engine failed', 
      error: error.message 
    });
  }
};
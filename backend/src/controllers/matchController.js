const matchingService = require('../../../../BBLISS/backend/src/services/matchingService');

exports.getDiscoveryFeed = async (req, res) => {
  try {
    const candidates = await matchingService.getDiscoveryCandidates(req.user._id);
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Matching engine failed', error: error.message });
  }
};
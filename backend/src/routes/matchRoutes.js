import express from 'express';
// Example controller imports - ensure these files exist and use .js extensions!
// import { getMatches, createMatch } from '../controllers/matchController.js';

const router = express.Router();

/**
 * @route   GET /api/matches
 * @desc    Get all matches
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({ message: "Match list retrieved successfully" });
});

/**
 * @route   POST /api/matches
 * @desc    Create a new match
 * @access  Private
 */
router.post('/', (req, res) => {
    const { teamA, teamB } = req.body;
    
    if (!teamA || !teamB) {
        return res.status(400).json({ error: "Missing required match fields" });
    }

    res.status(201).json({ 
        message: "Match created", 
        data: { teamA, teamB, timestamp: new Date() } 
    });
});

export default router;
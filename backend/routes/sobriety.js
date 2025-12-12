const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get sobriety log
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM SobrietyLog WHERE user_id = $1', [req.userId]);
        if (result.rows.length === 0) {
            // Return default empty log instead of 404 for new users
            return res.json({ start_date: null, current_streak: 0, relapses_json: null });
        }
        
        const log = result.rows[0];
        
        // Recalculate streak to ensure accuracy (in case relapses were updated elsewhere)
        if (log.start_date) {
            const relapses = log.relapses_json 
                ? (typeof log.relapses_json === 'string' ? JSON.parse(log.relapses_json) : log.relapses_json)
                : [];
            
            const startDate = new Date(log.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            
            // Find the most recent relapse date
            let lastRelapseDate = null;
            if (relapses && relapses.length > 0) {
                const relapseDates = relapses
                    .map(r => typeof r === 'string' ? new Date(r) : new Date(r.date || r))
                    .filter(d => !isNaN(d.getTime()))
                    .sort((a, b) => b - a);
                
                if (relapseDates.length > 0) {
                    lastRelapseDate = relapseDates[0];
                    lastRelapseDate.setHours(0, 0, 0, 0);
                }
            }
            
            // Calculate streak from the most recent event (relapse or start date)
            const referenceDate = lastRelapseDate && lastRelapseDate > startDate ? lastRelapseDate : startDate;
            const diffTime = today - referenceDate;
            log.current_streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        }
        
        res.json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or update sobriety log
router.post('/', async (req, res) => {
    const { start_date, relapses_json } = req.body;
    try {
        // Parse relapses if provided
        const relapses = relapses_json ? (Array.isArray(relapses_json) ? relapses_json : JSON.parse(relapses_json)) : [];
        
        // Calculate current streak properly
        let currentStreak = 0;
        if (start_date) {
            const startDate = new Date(start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            
            // Find the most recent relapse date
            let lastRelapseDate = null;
            if (relapses && relapses.length > 0) {
                const relapseDates = relapses
                    .map(r => typeof r === 'string' ? new Date(r) : new Date(r.date || r))
                    .filter(d => !isNaN(d.getTime()))
                    .sort((a, b) => b - a); // Sort descending
                
                if (relapseDates.length > 0) {
                    lastRelapseDate = relapseDates[0];
                    lastRelapseDate.setHours(0, 0, 0, 0);
                }
            }
            
            // Calculate streak from the most recent event (relapse or start date)
            const referenceDate = lastRelapseDate && lastRelapseDate > startDate ? lastRelapseDate : startDate;
            const diffTime = today - referenceDate;
            currentStreak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        }

        // Postgres UPSERT syntax: INSERT INTO ... ON CONFLICT(user_id) DO UPDATE SET ...
        const result = await pool.query(
            `INSERT INTO SobrietyLog (user_id, start_date, current_streak, relapses_json)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT(user_id) DO UPDATE SET
             start_date=excluded.start_date,
             current_streak=excluded.current_streak,
             relapses_json=excluded.relapses_json`,
            [req.userId, start_date, currentStreak, JSON.stringify(relapses_json || [])]
        );

        // Fetch updated row
        const updated = await pool.query('SELECT * FROM SobrietyLog WHERE user_id = $1', [req.userId]);
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;

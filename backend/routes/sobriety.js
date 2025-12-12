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
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or update sobriety log
router.post('/', async (req, res) => {
    const { start_date, relapses_json } = req.body;
    try {
        // Calculate current streak
        const startDate = new Date(start_date);
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Postgres UPSERT syntax: INSERT INTO ... ON CONFLICT(user_id) DO UPDATE SET ...
        const result = await pool.query(
            `INSERT INTO SobrietyLog (user_id, start_date, current_streak, relapses_json)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT(user_id) DO UPDATE SET
             start_date=excluded.start_date,
             current_streak=excluded.current_streak,
             relapses_json=excluded.relapses_json`,
            [req.userId, start_date, diffDays, JSON.stringify(relapses_json)]
        );

        // Fetch updated row
        const updated = await pool.query('SELECT * FROM SobrietyLog WHERE user_id = $1', [req.userId]);
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

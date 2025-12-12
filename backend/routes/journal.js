const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all journal entries for a user
router.get('/', async (req, res) => {
    const userId = req.userId;
    try {
        // Use array_agg to collect trigger IDs into an array
        const result = await pool.query(
            `SELECT j.id, j.date, j.mood_rating, j.note, j.created_at, 
                    COALESCE(json_agg(t.id) FILTER (WHERE t.id IS NOT NULL), '[]') as trigger_ids,
                    COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'category', t.category)) FILTER (WHERE t.id IS NOT NULL), '[]') as triggers
             FROM journals j
             LEFT JOIN journal_triggers jt ON j.id = jt.journal_id
             LEFT JOIN triggers t ON jt.trigger_id = t.id
             WHERE j.user_id = $1
             GROUP BY j.id
             ORDER BY j.date DESC`,
            [userId]
        );

        res.json({ entries: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new journal entry
router.post('/', async (req, res) => {
    const userId = req.userId;
    const { date, mood_rating, note, trigger_ids } = req.body;

    if (mood_rating !== undefined && (mood_rating < 1 || mood_rating > 10)) {
        return res.status(400).json({ error: 'Mood rating must be between 1 and 10' });
    }

    let client;
    try {
        // Access the raw pool object from the db module wrapper
        client = await pool.pool.connect();
        await client.query('BEGIN');

        // 1. Insert Journal Entry
        const journalResult = await client.query(
            `INSERT INTO journals (user_id, date, mood_rating, note)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [userId, date || new Date().toISOString(), mood_rating, note]
        );
        const journalId = journalResult.rows[0].id;

        // 2. Insert Triggers (if any)
        if (trigger_ids && Array.isArray(trigger_ids) && trigger_ids.length > 0) {
            const values = trigger_ids.map((tid, index) => `($1, $${index + 2})`).join(',');
            // $1 is journalId, $2... are triggerIds
            await client.query(
                `INSERT INTO journal_triggers (journal_id, trigger_id) VALUES ${values}`,
                [journalId, ...trigger_ids]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ id: journalId, message: 'Entry created' });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    } finally {
        if (client) client.release();
    }
});

// Delete a journal entry
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const result = await pool.query(
            'DELETE FROM journals WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Journal entry not found or user not authorized' });
        }

        res.status(204).send(); // No Content
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while deleting journal entry' });
    }
});

module.exports = router;

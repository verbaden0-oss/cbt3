const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');
const cbtRoutes = require('./routes/cbt');
const sobrietyRoutes = require('./routes/sobriety');
const triggersRoutes = require('./routes/triggers');
const pool = require('./db/db');

dotenv.config();

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'https://cbt-frontend-00t1.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Add CORS_ORIGIN from env if provided
if (process.env.CORS_ORIGIN && !allowedOrigins.includes(process.env.CORS_ORIGIN)) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin only in development (for tools like Postman, curl)
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS: No origin header in production'));
      }
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/cbt', cbtRoutes);
app.use('/api/sobriety', sobrietyRoutes);
app.use('/api/triggers', triggersRoutes);

async function ensureTables() {
  try {
    // PostgreSQL syntax
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        settings_json JSONB DEFAULT '{}'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        date TIMESTAMPTZ NOT NULL,
        mood_rating INTEGER,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS CBTExercises (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type TEXT NOT NULL,
        content_json JSONB,
        completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS SobrietyLog (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE,
        start_date TIMESTAMPTZ,
        current_streak INTEGER,
        relapses_json JSONB,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Triggers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL,
        category TEXT,
        count INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_triggers (
        journal_id INTEGER REFERENCES journals(id) ON DELETE CASCADE,
        trigger_id INTEGER REFERENCES triggers(id) ON DELETE CASCADE,
        PRIMARY KEY (journal_id, trigger_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
        badge_type VARCHAR(100) NOT NULL,
        earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('DB tables ensured');
  } catch (err) {
    console.error('Error ensuring tables', err);
    throw err;
  }
}

const PORT = process.env.PORT || 4000;

ensureTables().catch((e) => console.error('table init error', e));

app.get('/', (req, res) => res.send('CBT Backend is running'));

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

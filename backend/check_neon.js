const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_bMVcwNd5mIW8@ep-shiny-wildflower-a1xellrj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkDb() {
    try {
        console.log('Connecting to Neon DB...');
        const client = await pool.connect();
        console.log('✅ Connected!');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tables found:', res.rows.map(r => r.table_name));

        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}

checkDb();

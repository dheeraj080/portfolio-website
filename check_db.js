const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_EkDHib8oUhK9@ep-silent-sunset-ai0ykun2.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM photos WHERE is_favorite = true AND visibility = \'public\'');
    console.log(`Liked public photos: ${res.rowCount}`);
    if (res.rowCount > 0) {
      console.log('Sample photo url:', res.rows[0].url);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();

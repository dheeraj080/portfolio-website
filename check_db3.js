const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_EkDHib8oUhK9@ep-silent-sunset-ai0ykun2.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function run() {
  try {
    const res = await pool.query('SELECT title, url, is_favorite, visibility FROM photos');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_EkDHib8oUhK9@ep-silent-sunset-ai0ykun2.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM city_sets');
    console.log(`City sets: ${res.rowCount}`);
    
    const res2 = await pool.query('SELECT * FROM photos');
    console.log(`Total photos: ${res2.rowCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();

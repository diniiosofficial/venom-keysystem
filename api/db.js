const { Pool } = require('pg');

console.log("NEW DB FILE LOADED");

const pool = new Pool({
  connectionString: 'postgresql://postgres.jrclycbvndteikdqeeqq:DineshK%402003abi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
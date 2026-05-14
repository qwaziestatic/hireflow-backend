// src/config/testConnection.js
// ─────────────────────────────────────────────────────────────────────────────
// Run this BEFORE starting the server to verify NeonDB is reachable.
// Usage: node src/config/testConnection.js
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const pool = require("./db");

const testConnection = async () => {
  console.log("🔍 Testing NeonDB connection...\n");

  try {
    // Simple query — if this works, the DB is reachable and credentials are correct
    const result = await pool.query("SELECT NOW() AS current_time, version() AS pg_version");

    console.log("✅ Connected successfully!");
    console.log(`   Time on DB server : ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(",")[0]}\n`);

    // Also check that the tables exist (schema has been run)
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log("⚠️  No tables found. Did you run schema.sql?");
      console.log("   → In NeonDB SQL Editor, paste and run: src/config/schema.sql\n");
    } else {
      console.log("📋 Tables found:");
      tablesResult.rows.forEach((row) => console.log(`   - ${row.table_name}`));
      console.log("");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.error("\nCommon causes:");
    console.error("  1. DATABASE_URL in .env is wrong or missing");
    console.error("  2. Your IP is not whitelisted (NeonDB allows all by default)");
    console.error("  3. The NeonDB project is paused (free tier auto-pauses)");
    process.exit(1);
  }
};

testConnection();

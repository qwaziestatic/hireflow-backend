// src/config/db.js
// ─────────────────────────────────────────────────────────────────────────────
// This file creates a PostgreSQL connection POOL using the "pg" library.
// A pool keeps multiple connections open so the app doesn't reconnect on every
// single request — much faster and efficient.
// ─────────────────────────────────────────────────────────────────────────────

const { Pool } = require("pg"); // Import the Pool class from the pg library
require("dotenv").config(); // Load environment variables from .env file

// Create a new pool using the DATABASE_URL from your .env
// NeonDB provides this URL — it includes host, user, password, db name, and SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // SSL is REQUIRED for NeonDB (and most cloud Postgres providers)
  // rejectUnauthorized: false means we accept NeonDB's self-signed cert
  ssl: {
    rejectUnauthorized: false,
  },
});

// This event fires whenever a new client is checked out of the pool.
// Useful for debugging connection issues.
pool.on("connect", () => {
  console.log("✅ Connected to NeonDB PostgreSQL");
});

// This event fires if something goes wrong with the pool itself (not a query)
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err.message);
  process.exit(-1); // Kill the server — we can't work without a DB
});

// Export the pool so every other file can import and use it to run queries
module.exports = pool;

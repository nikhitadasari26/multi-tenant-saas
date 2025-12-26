const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "saas_db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "saas_db",
});

pool.on("connect", () => {
  console.log("Database connected successfully");
});

module.exports = pool;

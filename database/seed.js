import fs from "fs";
import path from "path";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runSeed() {
  await client.connect();
  console.log("Running seed data...");

  const seedFile = path.join(process.cwd(), "database/seeds/seed_data.sql");
  const sql = fs.readFileSync(seedFile, "utf8");

  await client.query(sql);
  await client.end();

  console.log("Seed data inserted");
}

runSeed().catch(err => {
  console.error(" Seed failed", err);
  process.exit(1);
});
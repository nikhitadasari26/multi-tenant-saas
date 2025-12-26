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

async function runMigrations() {
  await client.connect();
  console.log("Running migrations...");

  const migrationsDir = path.join(process.cwd(), "database/migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith(".sql")) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`Running ${file}`);
      await client.query(sql);
    }
  }

  await client.end();
  console.log("Migrations completed");
}

runMigrations().catch(err => {
  console.error("Migration failed", err);
  process.exit(1);
});
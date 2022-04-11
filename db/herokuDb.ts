import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import herokuSeed from "./herokuSeed";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const sqlConnection = async () => {
  await herokuSeed(pool);
  await pool.end();
};

sqlConnection();

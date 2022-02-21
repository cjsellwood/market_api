import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import seed from "./seed";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const sqlConnection = async () => {
  await seed(pool);
  await pool.end();
};

sqlConnection();

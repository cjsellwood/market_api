import dotenv from "dotenv";
dotenv.config();
const pgtools = require("pgtools");
import { Pool } from "pg";
import seed from "./seed"

const config = {
  user: "postgres",
  password: "password",
  port: 5432,
  host: "localhost",
};

pgtools.createdb(config, "market_api", (err: Error, res: unknown) => {
  if (err) {
    // If already exists ignore and continue
    if (err.name !== "duplicate_database") {
      process.exit(-1);
    }
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const sqlConnection = async () => {
    await seed(pool);
    await pool.end();
  };

  sqlConnection();
});

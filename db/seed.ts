import { Pool } from "pg";
import {
  randBetweenDate,
  randEmail,
  randPassword,
  randUserName,
} from "@ngneat/falso";
import bcrypt from "bcrypt";

const seed = async (pool: Pool) => {
  // Clear any existing tables
  await pool.query("DROP TABLE IF EXISTS app_user");

  // Create tables
  await pool.query(`CREATE TABLE app_user (
    user_id serial PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    joined DATE NOT NULL
  )`);

  // Generate default user data
  const users = [
    {
      username: "test",
      email: "test@email.com",
      password: await bcrypt.hash("test", 12),
      joined: new Date(Date.now()),
    },
  ];
  for (let i = 0; i < 9; i++) {
    users.push({
      username: randUserName(),
      email: randEmail(),
      password: await bcrypt.hash(randPassword(), 12),
      joined: randBetweenDate({ from: new Date("01/01/2022"), to: new Date() }),
    });
  }

  for (let user of users) {
    await pool.query(
      `INSERT INTO app_user(username, email, password, joined) VALUES($1, $2, $3, $4);`,
      [user.username, user.email, user.password, user.joined]
    );
  }
};

export default seed;

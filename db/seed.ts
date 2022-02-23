import { Pool } from "pg";
import {
  randBetweenDate,
  randEmail,
  randImg,
  randProductDescription,
  randProductName,
  randUserName,
} from "@ngneat/falso";

const seed = async (pool: Pool) => {
  // Clear any existing tables
  await pool.query("DROP TABLE IF EXISTS product");
  await pool.query("DROP TABLE IF EXISTS category");
  await pool.query("DROP TABLE IF EXISTS app_user");

  // Create app_user table
  await pool.query(`CREATE TABLE app_user (
    user_id serial PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    joined DATE NOT NULL
  )`);

  // Generate default user data - password is 'test' hashed
  const password = "$2b$12$nkw.avFoGW1Y0KSA78vAMu7DXogIva18YpQPnVWSjIska9ozJOXSy"
  const users = [
    {
      username: "test",
      email: "test@email.com",
      password: password,
      joined: new Date(Date.now()),
    },
  ];
  for (let i = 0; i < 9; i++) {
    users.push({
      username: randUserName(),
      email: randEmail(),
      password: password,
      joined: randBetweenDate({ from: new Date("01/01/2022"), to: new Date() }),
    });
  }

  // Insert default users
  for (let user of users) {
    await pool.query(
      `INSERT INTO app_user(username, email, password, joined)
        VALUES($1, $2, $3, $4);`,
      [user.username, user.email, user.password, user.joined]
    );
  }

  // Create categories table
  await pool.query(`CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  // Seed categories
  const categories = [
    "Cars",
    "Clothing",
    "Computers",
    "Electronics",
    "Food and Drink",
    "Home and Garden",
    "Sports",
  ];
  for (let category of categories) {
    await pool.query(
      `INSERT INTO category(name)
      VALUES($1)`,
      [category]
    );
  }

  // Create product table
  await pool.query(`CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_user(user_id),
    category_id INT NOT NULL REFERENCES category(category_id),
    title TEXT NOT NULL,
    description TEXT,
    price INT,
    image TEXT
  )`);

  // Default products
  const products = [];

  for (let i = 0; i < 50; i++) {
    products.push({
      user_id: Math.floor(Math.random() * 10 + 1),
      category_id: Math.floor(Math.random() * 7) + 1,
      title: randProductName(),
      description: randProductDescription(),
      price: Math.floor(Math.random() * 1000 + 10),
      image: randImg(),
    });
  }

  for (let product of products) {
    await pool.query(
      `INSERT INTO product(user_id, category_id, title, description, price, image)
        VALUES($1, $2, $3, $4, $5, $6)`,
      [
        product.user_id,
        product.category_id,
        product.title,
        product.description,
        product.price,
        product.image,
      ]
    );
  }
};

export default seed;

import { Pool } from "pg";
import {
  randBetweenDate,
  randCity,
  randEmail,
  randProductDescription,
  randProductName,
  randTextRange,
  randUserName,
} from "@ngneat/falso";

const seed = async (pool: Pool) => {
  // Clear any existing tables
  await pool.query("DROP TABLE IF EXISTS message");
  await pool.query("DROP TABLE IF EXISTS product");
  await pool.query("DROP TABLE IF EXISTS category");
  await pool.query("DROP TABLE IF EXISTS app_user");

  // Create app_user table
  await pool.query(`CREATE TABLE app_user (
    user_id serial PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    joined DATE NOT NULL
  )`);

  // Generate default user data - hashed "password"
  const password =
    "$2b$12$Bl8sprbG8TLdsVipyD2TteJt9pYp4.ZaWKo8HaN.lS2tpQLj6w.jG";
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
    images TEXT[],
    listed TIMESTAMP,
    location TEXT
  )`);

  await pool.query(`CREATE INDEX product_user_id_index ON product (user_id)`);
  await pool.query(
    `CREATE INDEX product_category_id_index ON product (category_id)`
  );

  // Default products
  const products = [];

  const placeImgs = [
    "https://placeimg.com/500/500/tech",
    "https://placeimg.com/500/500/arch",
    "https://placeimg.com/500/500/animals",
    "https://placeimg.com/500/500/nature",
    "https://placeimg.com/500/500/people",
  ];

  for (let i = 0; i < 50; i++) {
    products.push({
      user_id: Math.floor(Math.random() * 10 + 1),
      category_id: Math.floor(Math.random() * 7) + 1,
      title: randProductName(),
      description: randProductDescription(),
      price: Math.floor(Math.random() * 1000 + 10),
      images: [
        placeImgs[Math.floor(Math.random() * 5)],
        placeImgs[Math.floor(Math.random() * 5)],
        placeImgs[Math.floor(Math.random() * 5)],
      ],
      listed: randBetweenDate({ from: new Date("01/01/2022"), to: new Date() }),
      location: randCity(),
    });
  }

  for (let product of products) {
    await pool.query(
      `INSERT INTO product(user_id, category_id, title, description, price, images, listed, location)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        product.user_id,
        product.category_id,
        product.title,
        product.description,
        product.price,
        product.images,
        product.listed,
        product.location,
      ]
    );
  }

  // Create messages table
  await pool.query(`CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES product(product_id),
    sender INT NOT NULL REFERENCES app_user(user_id),
    receiver INT NOT NULL REFERENCES app_user(user_id),
    text TEXT NOT NULL,
    time TIMESTAMP NOT NULL
  )`);

  // Create indexes
  await pool.query(
    `CREATE INDEX message_product_id_index ON message (product_id)`
  );
  await pool.query(`CREATE INDEX message_sender_index ON message (sender)`);
  await pool.query(`CREATE INDEX message_receiver_index ON message (receiver)`);

  const productQuery = await pool.query(
    "SELECT user_id FROM product WHERE product_id = 29"
  );
  const authorId = productQuery.rows[0].user_id;

  const userId = (authorId % 10) + 1;
  for (let i = 0; i < 10; i++) {
    const sender = Math.random() > 0.5 ? authorId : userId;
    let receiver;
    if (sender === authorId) {
      receiver = userId;
    } else {
      receiver = authorId;
    }
    await pool.query(
      `INSERT INTO message(product_id, sender, receiver, text, time)
        VALUES ($1, $2, $3, $4, $5)`,
      [
        29,
        sender,
        receiver,
        randTextRange({ min: 8, max: 128 }),
        randBetweenDate({ from: new Date("01/01/2022"), to: new Date() }),
      ]
    );
  }

  const userId2 = ((authorId + 1) % 10) + 1;
  for (let i = 0; i < 10; i++) {
    const sender = Math.random() > 0.5 ? authorId : userId2;
    let receiver;
    if (sender === authorId) {
      receiver = userId2;
    } else {
      receiver = authorId;
    }
    await pool.query(
      `INSERT INTO message(product_id, sender, receiver, text, time)
        VALUES ($1, $2, $3, $4, $5)`,
      [
        29,
        sender,
        receiver,
        randTextRange({ min: 8, max: 128 }),
        randBetweenDate({ from: new Date("01/01/2022"), to: new Date() }),
      ]
    );
  }
};

export default seed;

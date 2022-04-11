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

const herokuSeed = async (pool: Pool) => {
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
    "Cars and Vehicles",
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

  // Default products
  const products = [];

  const placeImgs = [
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649653793/market/fz7hmqyyt9thyopacvgu.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649653795/market/nqukkqfqqahujdfjvyfm.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649653796/market/es5gzyaxjwhnkpnna3kf.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654020/market/d2jermwsdtcpg1hlvczd.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654022/market/zpvx5juzrgsihdx4buze.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654023/market/zzxaqjued8vtf15nnein.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654148/market/n92nktzfesi5ccrx0jnx.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654150/market/znfm5tmzc4lrqrumjawg.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654222/market/avcbairrh1bwt6tvccgp.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654224/market/nruq7v7tmtn6icgyvgu9.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654225/market/rki6isk4pqfe1rf82pjz.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654389/market/qzitk6acut8zj2es2qrt.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654391/market/nbejyjjvherxuxagkuw4.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654462/market/rw05kozaajyb0ao5evkm.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654464/market/wkmmw2romw69zsxonyrx.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654466/market/alc9ymrwyrekucrs6ee8.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654540/market/h4gdxr7y87bb5cmdoztd.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654542/market/q2ugvtf6olbfbfwly03f.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654544/market/itxqypzjy6ahs0iqxtyn.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654610/market/tgm6bxsbsylyr5r69enq.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654612/market/dg5va8ncjrkqeexn83as.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654613/market/ugfqgnwvtyezkzdiyugu.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654675/market/povt8jqcexv4rjzfv8nt.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654677/market/v2xgvelvs0flfmof3dd8.webp",
    ],
    [
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654732/market/hbit1skxb5znxyvdsuri.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654734/market/kefhiacdwkebzfnkrkbp.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654735/market/libwbxqxfyhcrd7hg3cg.webp",
      "https://res.cloudinary.com/due9a2put/image/upload/v1649654829/market/hrgqeqcicudnf1qmhpnn.webp",
    ],
  ];

  for (let i = 0; i < 50; i++) {
    const category_id = Math.floor(Math.random() * 7) + 1;
    const imageNumber = Math.floor(Math.random() * 4);
    products.push({
      user_id: Math.floor(Math.random() * 10 + 1),
      category_id: category_id,
      title: randProductName(),
      description: randProductDescription(),
      price: Math.floor(Math.random() * 1000 + 10),
      images: [
        placeImgs[category_id - 1][imageNumber],
        placeImgs[category_id - 1][(imageNumber + 1) % 4],
        placeImgs[category_id - 1][(imageNumber + 2) % 4],
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
};

export default herokuSeed;

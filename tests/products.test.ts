import { Pool } from "pg";
import app from "../app";
import seed from "../db/seed";
import supertest from "supertest";

const api = supertest(app);

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "market_api",
  password: "password",
  port: 5432,
});

const query = (text: string, params: unknown[]) => pool.query(text, params);

describe("Product routes", () => {
  beforeEach(async () => {
    await seed(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  test("Return 20 random products", async () => {
    const res = await api.get("/products/random").expect(200);

    expect(res.body.length).toBe(20);
    const ids = res.body.map(
      (product: { product_id: number }) => product.product_id
    );

    const sorted = [...ids].sort((a, b) => a - b);
    expect(ids).not.toEqual(sorted);
  });

  test("Sends data on a single product", async () => {
    const dbProduct = await query(
      `SELECT product_id, title, description, price, images, listed, location, app_user.username, category.name as category FROM product 
      JOIN category ON product.category_id = category.category_id
      JOIN app_user ON product.user_id = app_user.user_id
        WHERE product_id = 29`,
      []
    );
    const expectedProduct = dbProduct.rows[0];
    expectedProduct.listed = expectedProduct.listed.toISOString();
    const res = await api.get("/products/29").expect(200);

    expect(res.body).toEqual(expectedProduct);
  });

  test("Send error if product not in database", async () => {
    const res = await api.get("/products/99").expect(404);

    expect(res.body.error).toBe("Product not found");
  });
});

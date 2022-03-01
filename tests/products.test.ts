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
});

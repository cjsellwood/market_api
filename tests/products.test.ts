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

  describe("All Products Route", () => {
    test("Gets all products", async () => {
      const res = await api.get("/products").expect(200);

      expect(res.body.count).toBe("50");

      const products = res.body.products;
      expect(products.length).toBe(20);

      const dates = products.map((product: { listed: Date }) => product.listed);

      // Sorted by most recent
      const sorted = [...dates].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      expect(dates).toEqual(sorted);
    });

    test("Gets 2nd page of products", async () => {
      const allResult = await query(
        `SELECT product_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const res = await api.get("/products?page=2").expect(200);

      expect(res.body.count).toBe("50");

      const products = res.body.products;
      expect(products.length).toBe(20);
      expect(products).toEqual(allProducts.slice(20, 40));
    });

    test("Gets last page of products", async () => {
      const allResult = await query(
        `SELECT product_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const res = await api.get("/products?page=3").expect(200);

      expect(res.body.count).toBe("50");

      const products = res.body.products;
      expect(products.length).toBe(10);
      expect(products).toEqual(allProducts.slice(40, 50));
    });

    test("Returns products if received count from previous query", async () => {
      const res = await api.get("/products?count=50");

      expect(res.body.count).toBe("50");

      const products = res.body.products;
      expect(products.length).toBe(20);
    });

    test("Return not found error if offset greater than count", async () => {
      const res = await api.get("/products?count=50&page=5");

      expect(res.body.count).toBe("50");
      const products = res.body.products;
      expect(products.length).toBe(0);
    });
  });

  describe("Category products route", () => {
    test("Gets products with a specified category", async () => {
      const allResult = await query(
        `SELECT product_id, category_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const filteredProducts = allProducts.filter(
        (product) => product.category_id === 1
      );

      const res = await api.get("/products/category/1").expect(200);

      expect(res.body.products.length).toBe(filteredProducts.length);
    });
  });

  describe("Search products route", () => {
    test("Gets products matching a search query", async () => {
      const allResult = await query(
        `SELECT product_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const filteredProducts = allProducts.filter(
        (product) =>
          /the/i.test(product.title) || /the/i.test(product.description)
      );

      const res = await api.get("/products/search?q=the").expect(200);

      expect(res.body.count).toBe(filteredProducts.length.toString());
      expect(
        res.body.products.find(
          (el: { product_id: number }) =>
            el.product_id === filteredProducts[0].product_id
        )
      ).toEqual(filteredProducts[0]);

      expect(
        res.body.products.find(
          (el: { product_id: number }) =>
            el.product_id === filteredProducts[1].product_id
        )
      ).toEqual(filteredProducts[1]);
    });

    test("Search with zero results", async () => {
      const res = await api
        .get("/products/search?q=zzzzzzzzzzzzzzzzz")
        .expect(200);

      expect(res.body.count).toBe("0");
      expect(res.body.products).toEqual([]);
    });

    test("Search with 1-20 results", async () => {
      const allResult = await query(
        `SELECT product_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      const res = await api
        .get(`/products/search?q=${allProducts[0].description}`)
        .expect(200);

      const filteredProducts = allProducts.filter((product) => {
        const re = new RegExp(`${allProducts[0].description}`, "i");
        return re.test(product.title) || re.test(product.description);
      });

      expect(res.body.count).toBe(filteredProducts.length.toString());
      expect(res.body.products.length).toEqual(filteredProducts.length);
    });
  });
});

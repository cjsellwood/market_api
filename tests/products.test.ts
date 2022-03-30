import { Pool } from "pg";
import app from "../app";
import seed from "../db/seed";
import supertest from "supertest";
import * as upload from "../utils/cloudFiles";
import StatusError from "../utils/StatusError";
import issueJWT from "../utils/issueJWT";
import jsonwebtoken from "jsonwebtoken";

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("Random products route", () => {
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

  describe("Single product route", () => {
    test("Sends data on a single product", async () => {
      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
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

    test("Returns messages about the product from the user if logged in", async () => {
      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
        JOIN category ON product.category_id = category.category_id
        JOIN app_user ON product.user_id = app_user.user_id
          WHERE product_id = 29`,
        []
      );
      const authorId = dbProduct.rows[0].user_id;
      const userId = (authorId % 10) + 1;

      const jwt = issueJWT(userId);

      const res = await api
        .get("/products/29")
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(200);

      expect(res.body.messages).toBeDefined();
      expect(res.body.messages.length).toBe(10);
    });

    test("Returns all messages to author of product", async () => {
      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
        JOIN category ON product.category_id = category.category_id
        JOIN app_user ON product.user_id = app_user.user_id
          WHERE product_id = 29`,
        []
      );
      const authorId = dbProduct.rows[0].user_id;
      const jwt = issueJWT(authorId);

      const res = await api
        .get("/products/29")
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(200);

      expect(res.body.messages).toBeDefined();
      expect(res.body.messages.length).toBe(20);
    });
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

    test("Returning count if number of products less than 20", async () => {
      await query(`DELETE FROM message WHERE product_id > 10`, []);
      await query(`DELETE FROM product WHERE product_id > 10`, []);
      const res = await api.get("/products").expect(200);

      expect(res.body.count).toBe("10");

      const products = res.body.products;
      expect(products.length).toBe(10);
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
      expect(res.body.count).toBe(filteredProducts.length.toString());
    });

    test("Gets page 3 of a categories products", async () => {
      await query(
        `UPDATE product SET category_id = 1 WHERE product_id > 0`,
        []
      );
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

      const res = await api.get("/products/category/1?page=3").expect(200);

      expect(res.body.products.length).toBe(10);
      expect(res.body.count).toBe(filteredProducts.length.toString());
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

    test("Search within a specific category", async () => {
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
        (product) =>
          (/the/i.test(product.title) || /the/i.test(product.description)) &&
          product.category_id === 1
      );

      for (let product of filteredProducts) {
        delete product.category_id;
      }
      const res = await api
        .get("/products/search?q=the&category=1")
        .expect(200);

      expect(res.body.count).toEqual(filteredProducts.length.toString());
      expect(
        res.body.products.sort(
          (a: { product_id: number }, b: { product_id: number }) =>
            a.product_id - b.product_id
        )
      ).toEqual(
        filteredProducts.sort(
          (a: { product_id: number }, b: { product_id: number }) =>
            a.product_id - b.product_id
        )
      );
    });

    test("Getting a second page of category search results", async () => {
      await query(
        `UPDATE product SET category_id = 1, title = 'the' WHERE product_id > 0`,
        []
      );

      const res = await api
        .get("/products/search?page=2&q=the&category=1")
        .expect(200);

      expect(res.body.count).toBe("50");
      expect(res.body.products.length).toBe(20);
    });
  });

  describe("User products route", () => {
    test("Returns products created by user", async () => {
      const allResult = await query(
        `SELECT product_id, user_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const filteredProducts = allProducts.filter(
        (product) => product.user_id === 1
      );

      for (let product of filteredProducts) {
        delete product.user_id;
      }

      const jwt = issueJWT(1);

      const res = await api
        .get("/products/user")
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(200);

      expect(res.body.products).toEqual(filteredProducts);
      expect(res.body.count).toEqual(filteredProducts.length.toString());
    });

    test("Returns page 3 of products created by user", async () => {
      await query(`UPDATE product SET user_id = 1 WHERE product_id > 0`, []);

      const allResult = await query(
        `SELECT product_id, user_id, title, description, price, images[1] as image, location, listed
      FROM product ORDER BY listed DESC`,
        []
      );
      const allProducts = allResult.rows;
      for (let product of allProducts) {
        product.listed = product.listed.toISOString();
      }

      const filteredProducts = allProducts.filter(
        (product) => product.user_id === 1
      );

      for (let product of filteredProducts) {
        delete product.user_id;
      }

      const jwt = issueJWT(1);

      const res = await api
        .get("/products/user?page=3")
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(200);

      expect(res.body.products.length).toBe(10);
      expect(res.body.count).toEqual(filteredProducts.length.toString());
    });
  });

  describe("New product route", () => {
    test("Can add new product", async () => {
      jest
        .spyOn(upload, "uploadFile")
        .mockReturnValue(Promise.resolve({ url: "uploaded image url" }));

      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(200);

      expect(res.body.product_id).toBe(51);

      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.username, category.name as category FROM product 
        JOIN category ON product.category_id = category.category_id
        JOIN app_user ON product.user_id = app_user.user_id
          WHERE product_id = 51`,
        []
      );

      expect(dbProduct.rows[0]).toEqual({
        product_id: 51,
        title: "new product",
        description: "new product description",
        price: 99,
        images: ["uploaded image url", "uploaded image url"],
        listed: dbProduct.rows[0].listed,
        location: "Melbourne",
        username: "test",
        category: "Cars",
      });
    });

    test("Don't add product if no authorization added", async () => {
      const res = await api
        .post("/products/new")
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(401);

      expect(res.body.error).toBe("You are not logged in");
    });

    test("Don't add product if token expired", async () => {
      const payload = {
        sub: 1,
        iat: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 8,
      };
      const signedToken = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE!, {
        expiresIn: "7d",
      });

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${signedToken}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(401);

      expect(res.body.error).toBe("You are not logged in");
    });

    test("Send error if image upload failed", async () => {
      jest.spyOn(upload, "uploadFile").mockImplementation(() => {
        return Promise.reject(new StatusError("Image upload error", 500));
      });

      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(500);

      expect(res.body.error).toBe("Image upload error");
    });

    test("Send error if more than 3 images", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe("Maximum of 3 images allowed");
    });

    test("Don't add new product if no title", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe('"title" is required');
    });

    test("Don't add if category_id invalid", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "8")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe(
        '"category_id" must be less than or equal to 7'
      );
    });

    test("Don't add if description too short", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "de")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe(
        '"description" length must be at least 4 characters long'
      );
    });

    test("Don't add if price not a number", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99k")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe('"price" must be a number');
    });

    test("Don't add if location too short", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Me")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe(
        '"location" length must be at least 3 characters long'
      );
    });
  });

  describe("Delete product route", () => {
    test("Can delete a specified product", async () => {
      // Create new product
      jest
        .spyOn(upload, "uploadFile")
        .mockReturnValue(Promise.resolve({ url: "uploaded image url" }));

      jest.spyOn(upload, "deleteFile").mockReturnValue(
        Promise.resolve({
          result: "ok",
        })
      );

      const jwt = issueJWT(1);

      const newProduct = await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(200);

      // Delete product
      await api
        .delete(`/products/${newProduct.body.product_id}`)
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(200);

      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.username, category.name as category FROM product 
          JOIN category ON product.category_id = category.category_id
          JOIN app_user ON product.user_id = app_user.user_id
            WHERE product_id = $1`,
        [newProduct.body.product_id]
      );

      expect(dbProduct.rows.length).toBe(0);
      expect(upload.deleteFile).toHaveBeenCalledWith("uploaded image url");
      expect(upload.deleteFile).toHaveBeenCalledTimes(2);
    });

    test("Return error if trying to delete a product that does not exist", async () => {
      const jwt = issueJWT(1);

      const res = await api
        .delete(`/products/999`)
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(404);

      expect(res.body.error).toBe("Product not found");
    });

    test("Can't delete product if they did not create it", async () => {
      const dbResult = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
          JOIN category ON product.category_id = category.category_id
          JOIN app_user ON product.user_id = app_user.user_id
            WHERE app_user.user_id != $1
            LIMIT 1`,
        [1]
      );
      const dbProduct = dbResult.rows[0];

      const jwt = issueJWT(1);

      const res = await api
        .delete(`/products/${dbProduct.product_id}`)
        .set("Authorization", `Bearer ${jwt.token}`)
        .expect(401);

      expect(res.body.error).toBe("You are not the author");
    });
  });

  describe("Update product route", () => {
    test("Updates a product", async () => {
      jest
        .spyOn(upload, "uploadFile")
        .mockReturnValueOnce(Promise.resolve({ url: "uploaded image url" }))
        .mockReturnValueOnce(Promise.resolve({ url: "uploaded image url" }));

      const jwt = issueJWT(1);

      // Create new product
      await api
        .post("/products/new")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(200);

      jest
        .spyOn(upload, "uploadFile")
        .mockReturnValueOnce(Promise.resolve({ url: "updated image url" }))
        .mockReturnValueOnce(Promise.resolve({ url: "updated image url" }));
      jest.spyOn(upload, "deleteFile").mockReturnValue(
        Promise.resolve({
          result: "ok",
        })
      );

      // Update product
      const res = await api
        .put("/products/51")
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "updated product")
        .field("category_id", "2")
        .field("description", "updated product description")
        .field("price", "101")
        .field("location", "Melbourne")
        .field(
          "updatedImages",
          JSON.stringify(["!uploaded image url", "!uploaded image url", ""])
        )
        .attach("images", "tests/image2.png")
        .attach("images", "tests/image1.jpg")
        .expect(200);

      expect(res.body.product_id).toBe("51");
      expect(upload.uploadFile).toHaveBeenCalledTimes(4);
      expect(upload.deleteFile).toHaveBeenCalledTimes(2);

      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.username, category.name as category FROM product 
          JOIN category ON product.category_id = category.category_id
          JOIN app_user ON product.user_id = app_user.user_id
            WHERE product_id = $1`,
        [res.body.product_id]
      );

      expect(dbProduct.rows[0]).toEqual({
        product_id: 51,
        title: "updated product",
        category: "Clothing",
        description: "updated product description",
        images: ["updated image url", "updated image url"],
        price: 101,
        location: "Melbourne",
        listed: dbProduct.rows[0].listed,
        username: "test",
      });
    });

    test("Send error if more than 3 images", async () => {
      const dbResult = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
          JOIN category ON product.category_id = category.category_id
          JOIN app_user ON product.user_id = app_user.user_id
            WHERE app_user.user_id = $1
            LIMIT 1`,
        [1]
      );
      const dbProduct = dbResult.rows[0];
      const jwt = issueJWT(1);

      const res = await api
        .put(`/products/${dbProduct.product_id}`)
        .set("Authorization", `Bearer ${jwt.token}`)
        .field("title", "new product")
        .field("category_id", "1")
        .field("description", "new product description")
        .field("price", "99")
        .field("location", "Melbourne")
        .field(
          "updatedImages",
          JSON.stringify(["!uploaded image url", "!uploaded image url", ""])
        )
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image1.jpg")
        .attach("images", "tests/image2.png")
        .expect(400);

      expect(res.body.error).toBe("Maximum of 3 images allowed");
    });
  });

  describe("Save message route", () => {
    test("Saves new message to server", async () => {
      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
        JOIN category ON product.category_id = category.category_id
        JOIN app_user ON product.user_id = app_user.user_id
          WHERE product_id = 29`,
        []
      );
      const authorId = dbProduct.rows[0].user_id;
      const userId = (authorId % 10) + 1;

      const jwt = issueJWT(userId);

      const res = await api
        .post("/products/29")
        .set("Authorization", `Bearer ${jwt.token}`)
        .send({ text: "New message", receiver: authorId })
        .expect(200);

      expect(res.body.message).toBe("Success");

      const dbMessages = await query(`SELECT * FROM message`, []);
      expect(dbMessages.rows.length).toBe(21);
      expect(dbMessages.rows.at(-1).product_id).toBe(29);
      expect(dbMessages.rows.at(-1).sender).toBe(userId);
      expect(dbMessages.rows.at(-1).receiver).toBe(authorId);
      expect(dbMessages.rows.at(-1).text).toBe("New message");
    });

    test("Saves message when user if author", async () => {
      const dbProduct = await query(
        `SELECT product_id, title, description, price, images, listed, location, app_user.user_id, app_user.username, category.name as category FROM product 
        JOIN category ON product.category_id = category.category_id
        JOIN app_user ON product.user_id = app_user.user_id
          WHERE product_id = 29`,
        []
      );
      const authorId = dbProduct.rows[0].user_id;
      const receiverId = (authorId % 10) + 1;

      const jwt = issueJWT(authorId);

      const res = await api
        .post("/products/29")
        .set("Authorization", `Bearer ${jwt.token}`)
        .send({ text: "New message", receiver: receiverId })
        .expect(200);

      expect(res.body.message).toBe("Success");

      const dbMessages = await query(`SELECT * FROM message`, []);
      expect(dbMessages.rows.length).toBe(21);
      expect(dbMessages.rows.at(-1).product_id).toBe(29);
      expect(dbMessages.rows.at(-1).sender).toBe(authorId);
      expect(dbMessages.rows.at(-1).receiver).toBe(receiverId);
      expect(dbMessages.rows.at(-1).text).toBe("New message");
    });
  });
});

import supertest from "supertest";
import app from "../app";

const api = supertest(app);

it("should show working test route", async () => {
  const res = await api.get("/").expect(200).expect("Content-Type", /text/);
  expect(res.text).toBe("App working");
});

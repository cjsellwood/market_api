import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("App working");
});

app.use(express.json());
app.use(morgan("dev", { skip: () => process.env.NODE_ENV === "test" }));

export default app;

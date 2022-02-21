import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import StatusError from "./utils/StatusError";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("App working");
});

app.use(express.json());
app.use(morgan("dev", { skip: () => process.env.NODE_ENV === "test" }));

// Error handling
app.use(
  (error: StatusError, req: Request, res: Response, next: NextFunction) => {
    console.log("ERROR: ", error.status, " ", error.message);
    res.status(error.status || 500).send(error.message);
  }
);

export default app;

import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import StatusError from "./utils/StatusError";
import authRouter from "./routes/authRouter";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("App working");
});

// Middleware
app.use(express.json());
app.use(cors())
app.use(morgan("dev", { skip: () => process.env.NODE_ENV === "test" }));

// Routes
app.use("/auth", authRouter);

// Error handling
app.use(
  (error: StatusError, req: Request, res: Response, next: NextFunction) => {
    // console.log("ERROR: ", error.status, " ", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
);

export default app;

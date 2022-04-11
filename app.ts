import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import StatusError from "./utils/StatusError";
import authRouter from "./routes/authRouter";
import productRouter from "./routes/productRouter";
import helmet from "helmet";
import compression from "compression";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("App working");
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev", { skip: () => process.env.NODE_ENV === "test" }));
app.use(helmet());
app.use(compression());

// Routes
app.use("/auth", authRouter);
app.use("/products", productRouter);

// Error handling
app.use(
  (error: StatusError, req: Request, res: Response, next: NextFunction) => {
    // console.log("ERROR: ", error.status, " ", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
);

export default app;

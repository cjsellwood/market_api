import express from "express";
import { randomProducts } from "../controllers/productController";
const router = express.Router();

router.get("/random", randomProducts);

export default router;

import express from "express";
import { randomProducts } from "../controllers/randomProducts";
const router = express.Router();

router.get("/random", randomProducts);

export default router;

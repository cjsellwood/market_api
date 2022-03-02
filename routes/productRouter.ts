import express from "express";
import {
  randomProducts,
  singleProduct,
} from "../controllers/productController";
const router = express.Router();

router.get("/random", randomProducts);

router.get("/:id", singleProduct);

export default router;

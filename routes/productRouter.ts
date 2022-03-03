import express from "express";
import {
  allProducts,
  categoryProducts,
  randomProducts,
  singleProduct,
} from "../controllers/productController";
const router = express.Router();

router.get("/", allProducts);

router.get("/random", randomProducts);

router.get("/:id", singleProduct);

router.get("/category/:category_id", categoryProducts);

export default router;

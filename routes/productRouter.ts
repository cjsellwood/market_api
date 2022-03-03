import express from "express";
import {
  allProducts,
  categoryProducts,
  randomProducts,
  singleProduct,
  searchProducts
} from "../controllers/productController";
const router = express.Router();

router.get("/", allProducts);

router.get("/random", randomProducts);

router.get("/search", searchProducts);

router.get("/category/:category_id", categoryProducts);

router.get("/:id", singleProduct);

export default router;

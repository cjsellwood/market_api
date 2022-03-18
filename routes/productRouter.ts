import express from "express";
import {
  allProducts,
  categoryProducts,
  randomProducts,
  singleProduct,
  searchProducts,
  newProduct,
} from "../controllers/productController";
import multer from "multer";
import { validateNewProduct } from "../middleware/validation";
const upload = multer();

const router = express.Router();

router.get("/", allProducts);

router.get("/random", randomProducts);

router.get("/search", searchProducts);

router.post("/new", upload.array("images"), validateNewProduct, newProduct);

router.get("/category/:category_id", categoryProducts);

router.get("/:id", singleProduct);

export default router;

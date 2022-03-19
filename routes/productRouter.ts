import express from "express";
import {
  allProducts,
  categoryProducts,
  randomProducts,
  singleProduct,
  searchProducts,
  newProduct,
  deleteProduct,
  updateProduct,
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

router.delete("/:id", deleteProduct);

router.put("/:id", upload.array("images"), updateProduct);

export default router;

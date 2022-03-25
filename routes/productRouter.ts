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
import isLoggedIn from "../middleware/isLoggedIn";
import isAuthor from "../middleware/isAuthor";
const upload = multer();

const router = express.Router();

router.get("/", allProducts);

router.get("/random", randomProducts);

router.get("/search", searchProducts);

router.post(
  "/new",
  isLoggedIn,
  upload.array("images"),
  validateNewProduct,
  newProduct
);

router.get("/category/:category_id", categoryProducts);

router.get("/:id", singleProduct);

router.delete("/:id", isLoggedIn, isAuthor, deleteProduct);

router.put("/:id", isLoggedIn, isAuthor, upload.array("images"), updateProduct);

export default router;

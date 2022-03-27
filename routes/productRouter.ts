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
  userProducts,
} from "../controllers/productController";
import multer from "multer";
import {
  validateNewProduct,
  validateUpdateProduct,
} from "../middleware/validation";
import isLoggedIn from "../middleware/isLoggedIn";
import isAuthor from "../middleware/isAuthor";
const upload = multer();

const router = express.Router();

router.get("/", allProducts);

router.get("/random", randomProducts);

router.get("/search", searchProducts);

router.get("/user", isLoggedIn, userProducts);

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

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("images"),
  validateUpdateProduct,
  updateProduct
);

export default router;

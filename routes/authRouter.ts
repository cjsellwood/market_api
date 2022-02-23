import express from "express";
import {
  registerUser,
  loginUser,
  protectedRoute,
} from "../controllers/authController";
import { validateRegister, validateLogin } from "../middleware/validation";
import isLoggedIn from "../middleware/isLoggedIn";
const router = express.Router();

router.post("/register", validateRegister, registerUser);

router.post("/login", validateLogin, loginUser);

router.get("/protected", isLoggedIn, protectedRoute);

export default router;

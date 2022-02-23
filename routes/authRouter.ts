import express from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { validateRegister } from "../validation";
const router = express.Router();

router.post("/register", validateRegister, registerUser);

router.post("/login", loginUser)

export default router;

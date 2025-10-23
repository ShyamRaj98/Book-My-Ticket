import express from "express";
import { registerAdmin, loginAdmin } from "../../controllers/adminAuthController.js";

const router = express.Router();

// Public routes for admin
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;

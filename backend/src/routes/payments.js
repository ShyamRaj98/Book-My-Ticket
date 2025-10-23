// routes/payments.js
import express from "express";
import { auth } from "../middlewares/auth.js";
import { createPaymentIntent } from "../controllers/paymentController.js";

const router = express.Router();

// POST /api/payments/create-intent
router.post("/create-intent", auth, createPaymentIntent);

export default router;

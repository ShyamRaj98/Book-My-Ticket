import express from "express";
import { auth } from "../middlewares/auth.js"; // ensure user auth for booking ownership
import {
  createPaymentIntent,
  createUpiOrder,
  checkUpiStatus,
  createAmazonOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-intent", auth, createPaymentIntent);

// UPI endpoints
router.post("/create-upi", auth, createUpiOrder);
router.get("/check-upi-status", auth, checkUpiStatus);

// Amazon pay
router.post("/create-amazon-order", auth, createAmazonOrder);

export default router;

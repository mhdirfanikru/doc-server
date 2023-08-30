import express from "express";
import {order, verifyPayment} from "../controller/paymentController.js";
import { verifyToken } from "../middleWares/userAuth.js";
const router = express.Router();

router.get('/orders',order);

router.post('/verify',verifyPayment);

export default router;
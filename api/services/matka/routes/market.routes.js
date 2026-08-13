import express from "express";
import {
  getAllMarkets,
  addMarket,
  deleteMarket,
  declareResult,
} from "../controllers/market.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Public Read Endpoints
router.get("/get-all-markets", getAllMarkets);
router.get("/get-all-results", getAllMarkets);
router.get("/get-market-results", getAllMarkets);

// Protected Admin Endpoints
router.post("/add-market", verifyAdmin, addMarket);
router.delete("/delete-market", verifyAdmin, deleteMarket);
router.post("/declare-result", verifyAdmin, declareResult);

export default router;

import express from "express";
import {
  getAllMarkets,
  addMarket,
  deleteMarket,
  declareResult,
} from "../controllers/market.controller.js";

const router = express.Router();

router.get("/get-all-markets", getAllMarkets);
router.post("/add-market", addMarket);
router.delete("/delete-market", deleteMarket);
router.post("/declare-result", declareResult);
router.get("/get-all-results", getAllMarkets);
router.get("/get-market-results", getAllMarkets);

export default router;

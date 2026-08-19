import express from "express";
import {
  getAllMarkets,
  addMarket,
  deleteMarket,
  deleteAllMarkets,
  updateMarketStatus,
  updateMarketDetails,
  declareResult,
  getMarketChartHistory,
  toggleAutoMaster,
} from "../controllers/market.controller.js";

import {
  getStarlineMarkets,
  declareStarlineResult
} from "../controllers/starline.controller.js";
import {
  getGaliMarkets,
  declareGaliResult,
  addGaliMarket,
  updateGaliMarket,
  deleteGaliMarket,
  deleteAllGaliMarkets
} from "../controllers/gali.controller.js";
import {
  getGameRates,
  addGameRate,
  updateGameRate,
  deleteGameRate
} from "../controllers/gamerate.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Main Market Endpoints
router.get("/get-all-markets", getAllMarkets);
router.get("/get-all-results", getAllMarkets);
router.get("/get-market-results", getAllMarkets);
router.get("/get-chart-history", getMarketChartHistory);
router.post("/add-market", verifyAdmin, addMarket);
router.post("/update-market", verifyAdmin, updateMarketDetails);
router.delete("/delete-market", verifyAdmin, deleteMarket);
router.delete("/delete-all-markets", verifyAdmin, deleteAllMarkets);
router.post("/update-market-status", verifyAdmin, updateMarketStatus);
router.post("/declare-result", verifyAdmin, declareResult);
router.post("/toggle-auto-master", toggleAutoMaster);

// Starline & Jackpot Endpoints (Time-slot based)
router.get("/get-starline-markets", getStarlineMarkets);
router.post("/declare-starline-result", verifyAdmin, declareStarlineResult);

// Gali Bazar Endpoints (Name + 2-digit Jodi based)
router.get("/get-gali-markets", getGaliMarkets);
router.post("/declare-gali-result", verifyAdmin, declareGaliResult);
router.post("/add-gali-market", verifyAdmin, addGaliMarket);
router.put("/update-gali-market/:id", verifyAdmin, updateGaliMarket);
router.delete("/delete-gali-market/:id", verifyAdmin, deleteGaliMarket);
router.delete("/delete-all-gali-markets", verifyAdmin, deleteAllGaliMarkets);

// Game Rates Endpoints
router.get("/get-game-rates", getGameRates);
router.post("/add-game-rate", verifyAdmin, addGameRate);
router.post("/update-game-rate", verifyAdmin, updateGameRate);
router.delete("/delete-game-rate", verifyAdmin, deleteGameRate);

export default router;

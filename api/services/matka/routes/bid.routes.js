import express from "express";
import { placeBid, getUserBids, getAllBids, deleteBid, updateAviatorBid } from "../controllers/bid.controller.js";
import { verifyToken, verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// User Protected Bidding Routes
router.post("/place-bid", verifyToken, placeBid);
router.post("/update-aviator-bid", verifyToken, updateAviatorBid);
router.get("/get-user-bids", verifyToken, getUserBids);

// Admin Protected Bidding Routes
router.get("/get-all-bids", verifyAdmin, getAllBids);
router.delete("/delete-bid/:id", verifyAdmin, deleteBid);

export default router;

import express from "express";
import { placeBid, getUserBids, getAllBids, deleteBid } from "../controllers/bid.controller.js";

const router = express.Router();

router.post("/place-bid", placeBid);
router.get("/get-user-bids", getUserBids);
router.get("/get-all-bids", getAllBids);
router.delete("/delete-bid/:id", deleteBid);

export default router;

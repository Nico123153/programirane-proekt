import express from "express";
import { getHistory } from "../controllers/HistoryController";

const router = express.Router();

router.get("/", getHistory);

export default router;

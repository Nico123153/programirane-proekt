import express from "express";
import { getInvestments, addInvestment, deleteInvestment } from "../controllers/InvestmentController";

const router = express.Router();

router.get("/", getInvestments);
router.post("/", addInvestment);
router.delete("/:id", deleteInvestment);

export default router;

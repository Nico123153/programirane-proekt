import { Request, Response } from "express";
import { db } from "../db";

// GET all history
export const getHistory = async (req: Request, res: Response) => {
    const [rows] = await db.query(
        "SELECT h.*, i.symbol FROM history h LEFT JOIN investments i ON h.investmentId = i.id ORDER BY h.date DESC"
    );

    res.json(rows);
};

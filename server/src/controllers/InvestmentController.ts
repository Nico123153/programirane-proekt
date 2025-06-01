import { Request, Response } from "express";
import { db } from "../db";

// GET all investments
export const getInvestments = async (req: Request, res: Response) => {
    const [rows] = await db.query("SELECT * FROM investments");
    res.json(rows);
};

// ADD investment + log history
export const addInvestment = async (req: Request, res: Response) => {
    const { symbol, type, quantity, price } = req.body;
    const [result]: any = await db.query(
        "INSERT INTO investments (symbol, type, quantity, price) VALUES (?, ?, ?, ?)",
        [symbol, type, quantity, price]
    );
    const investmentId = result.insertId;
    await db.query(
        "INSERT INTO history (investmentId, action, date) VALUES (?, ?, NOW())",
        [investmentId, "created"]
    );
    res.json({ message: "Investment added", id: investmentId });
};

// **Corrected DELETE function**
export const deleteInvestment = async (req: Request, res: Response) => {
    const id = req.params.id;
    // Log delete first
    await db.query(
        "INSERT INTO history (investmentId, action, date) VALUES (?, ?, NOW())",
        [id, "deleted"]
    );
    // Then delete the investment
    await db.query("DELETE FROM investments WHERE id = ?", [id]);
    res.json({ message: "Investment deleted" });
};

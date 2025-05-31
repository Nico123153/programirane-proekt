import { Request, Response } from 'express';
import { pool } from '../db';

export const InvestmentController = {
    async list(req: Request, res: Response) {
        const userId = Number(req.params.userId);
        try {
            const [rows] = await pool.query(
                'SELECT * FROM investments WHERE user_id=?',
                [userId]
            );
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: 'Database error' });
        }
    },

    async add(req: Request, res: Response) {
        const { userId, type, symbol, quantity, price } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO investments (user_id, type, symbol, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [userId, type, symbol, quantity, price]
            );
            res.json({ id: (result as any).insertId });
        } catch (err) {
            res.status(500).json({ message: 'Database error' });
        }
    },

    async remove(req: Request, res: Response) {
        const userId = Number(req.params.userId);
        const invId = Number(req.params.id);
        try {
            await pool.query(
                'DELETE FROM investments WHERE id=? AND user_id=?',
                [invId, userId]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ message: 'Database error' });
        }
    },
};

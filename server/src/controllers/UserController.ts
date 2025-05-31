import { Request, Response } from 'express';
import { pool } from '../db';

export async function login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT id, username, wallet FROM users WHERE username=? AND password=?',
            [username, password]
        );
        const user = (rows as any[])[0];
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
}

export async function getWallet(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    try {
        const [rows] = await pool.query(
            'SELECT wallet FROM users WHERE id=?',
            [userId]
        );
        const user = (rows as any[])[0];
        if (!user) return res.status(404).json({ message: 'Not found' });
        res.json({ wallet: user.wallet });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
}

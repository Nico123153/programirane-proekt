import { Request, Response } from 'express';
import { db } from '../db';

export const getAll = async (req: Request, res: Response) => {
    const [rows] = await db.query('SELECT * FROM investments');
    res.json(rows);
};

export const create = async (req: Request, res: Response) => {
    const { type, symbol, quantity, price } = req.body;
    await db.query(
        'INSERT INTO investments (type, symbol, quantity, price) VALUES (?, ?, ?, ?)',
        [type, symbol, quantity, price]
    );
    res.status(201).send('Investment created');
};
export const update = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);

    const { type, symbol, quantity, price } = req.body;
    await db.query(
        'UPDATE investments SET type = ?, symbol = ?, quantity = ?, price = ? WHERE id = ?',
        [type, symbol, quantity, price, id]
    );
    res.send('Investment updated');
};

export const remove = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);

    await db.query('DELETE FROM investments WHERE id = ?', [id]);
    res.send('Investment deleted');
};

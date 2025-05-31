import express from 'express';
import { getAll, create, update, remove } from '../controllers/investmentController';

const router = express.Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);     // ⬅ това трябва да го има!
router.delete('/:id', remove);  // ⬅ и това

export default router;

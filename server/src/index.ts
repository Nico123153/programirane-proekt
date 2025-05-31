import express from 'express';
import cors from 'cors';
import { login, getWallet } from './controllers/UserController'; // Note the change here!

const app = express();
app.use(cors());
app.use(express.json());

// User routes
// @ts-ignore
app.post('/api/login', login);
// @ts-ignore
app.get('/api/wallet/:userId', getWallet);

// ... more routes here

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});

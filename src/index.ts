import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import investmentRoutes from './routes/investments';





dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/investments', investmentRoutes);


app.get('/', (req, res) => {
    res.send('Server is working ✅');
});

const PORT = process.env.PORT || 3000;

// ⬇ Първо се тества връзката към MySQL
db.getConnection()
    .then(() => {
        console.log('✅ Connected to MySQL database');

        // ⬇ След това се стартира сървъра
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MySQL connection error:', err);
    });

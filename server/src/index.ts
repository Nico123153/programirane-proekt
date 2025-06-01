import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import investmentsRouter from "./routes/investments";
import historyRouter from "./routes/history";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/investments", investmentsRouter);
app.use("/api/history", historyRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

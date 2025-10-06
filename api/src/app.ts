import express from 'express';
import cors from 'cors';
import { httpLogger } from '@config/logger.config';
import authRoutes from "@auth/routes";

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Hello World!" });
})

export default app;
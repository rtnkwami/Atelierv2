import express from 'express';
import cors from 'cors';
import { httpLogger } from '@config/logger.config.ts';

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

// app.use()

export default app;
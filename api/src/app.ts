import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { httpLogger } from '@config/logger.config.ts';

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: 'Welcome to Atelier'
    });
})

export default app;
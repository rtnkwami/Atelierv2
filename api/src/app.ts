import express, { type Router } from 'express';
import cors from 'cors';
import { HttpLogger } from 'pino-http';

type dependencies = {
    authRouter: Router,
    httpLogger: HttpLogger
}

export default function createAPI ({ authRouter, httpLogger }: dependencies) {
    const app = express();

    app.use(httpLogger);
    app.use(express.json());
    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    app.use('/auth', authRouter);

    app.get('/health', (_, res) => {
        res.status(200).json({ message: "API is healthy." });
    })

    return app;
};
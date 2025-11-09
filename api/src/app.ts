import express, { type Router } from 'express';
import cors from 'cors';
import { HttpLogger } from 'pino-http';

type dependencies = {
    userRouter: Router;
    shopRouter: Router;
    httpLogger: HttpLogger;
}

export default function createAPI ({ userRouter, httpLogger, shopRouter }: dependencies) {
    const app = express();

    app.use(httpLogger);
    app.use(express.json());
    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    app.use('/users', userRouter);
    app.use('/shops', shopRouter);

    app.get('/health', (_, res) => {
        res.status(200).json({ message: "API is healthy." });
    })

    return app;
};
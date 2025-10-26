import express, { type Router } from 'express';
import cors from 'cors';
import { httpLogger } from '@config/logger.config';
import container from 'dependencyInjection';

type dependencies = {
    authRouter: Router
}

export function createApp ({ authRouter }: dependencies) {
    const app = express();

    // app.use(httpLogger);
    app.use(express.json());
    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    app.use('/auth', authRouter);

    app.get('/health', (req, res) => {
        res.status(200).json({ message: "API is healthy." });
    })

    return app;
}



// Dependency Injection
//-------------------------------------------
// Auth DI
const api = container.resolve('app');

export default api;

import express from 'express';
import cors from 'cors';
import { httpLogger } from '@config/logger.config';
import { prisma } from '@config/db.config';

import { createAuthRouter } from '@auth/routes';
import { createAuthRepository } from '@auth/auth.repository';
import { createAuthController } from '@auth/auth.controller';

export function createApp (dependencies: {
    authRouter: ReturnType<typeof createAuthRouter>
}) {
    const app = express();

    app.use(httpLogger);
    app.use(express.json());
    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    app.use('/auth', dependencies.authRouter);

    app.get('/', (req, res) => {
        res.json({ message: "Hello World!" });
    })

    return app;
}



// Dependency Injection
//-------------------------------------------
// Auth DI
const authRepo = createAuthRepository(prisma);
const authController = createAuthController(authRepo);
const authRouter = createAuthRouter(authController);
export default createApp({ authRouter });

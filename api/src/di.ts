import { createContainer, asFunction, asValue } from "awilix";
import { prisma } from "@config/db.config.ts";
import { createUserRepository } from "./modules/users/user.repository.ts";
import { createAuthService } from "@auth/auth.service.ts";
import { createAuthController } from "@auth/auth.controller.ts";
import { createUserService } from "modules/users/user.service.ts";
import { createUserController } from "modules/users/user.controller.ts";
import { createAuthRouter } from "@auth/auth.routes.ts";
import createAPI from "app.ts";
import logger, { httpLogger } from "@config/logger.config.ts";
import createUserRouter from "modules/users/user.routes.ts";

export default function createDiContainer () {
    const container = createContainer();
    
    container.register({
        db: asValue(prisma),
        baseLogger: asValue(logger),
        httpLogger: asValue(httpLogger),
        app: asFunction(createAPI).singleton(),

        authService: asFunction(createAuthService).scoped(),
        userService: asFunction(createUserService).scoped(),
        
        userController: asFunction(createUserController).scoped(),
        authController: asFunction(createAuthController).scoped(),
        
        userRepo: asFunction(createUserRepository).scoped(),
        
        authRouter: asFunction(createAuthRouter).singleton(),
        userRouter: asFunction(createUserRouter).scoped(),
    });

    return container;
};

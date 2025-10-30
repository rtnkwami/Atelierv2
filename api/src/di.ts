import { createContainer, asFunction, asValue } from "awilix";
import { prisma } from "@config/db.config.ts";
import { createUserRepository, IUserRepository } from "./modules/users/user.repository.ts";
import { createAuthService, IAuthService } from "@auth/auth.service.ts";
import { createAuthController, IAuthController } from "@auth/auth.controller.ts";
import { createUserService, IUserService } from "modules/users/user.service.ts";
import { createUserController, IUserController } from "modules/users/user.controller.ts";
import { createAuthRouter } from "@auth/auth.routes.ts";
import createAPI from "app.ts";
import logger, { httpLogger } from "@config/logger.config.ts";
import createUserRouter from "modules/users/user.routes.ts";
import { PrismaClient } from "../prisma-client/client.ts";
import { Logger } from "pino";
import { HttpLogger } from "pino-http";
import type { Express, Router } from "express";

type Cradle = {
    db: PrismaClient;
    baseLogger: Logger;
    httpLogger: HttpLogger;
    app: Express;
    
    authService: IAuthService;
    userService: IUserService;

    authController: IAuthController;
    userController: IUserController;
    
    userRepo: IUserRepository;

    authRouter: Router;
    userRouter: Router;
}

export default function createDiContainer () {
    const container = createContainer<Cradle>();
    
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

import { createContainer, asFunction, asValue, AwilixContainer } from "awilix";
import { prisma } from "@config/db.config.ts";
import logger, { httpLogger } from "@config/logger.config.ts";
import { PrismaClient } from "../prisma-client/client.ts";
import { Logger } from "pino";
import { HttpLogger } from "pino-http";
import type { Express, RequestHandler, Router } from "express";

import { createUserRepository, IUserRepository } from "./modules/users/user.repository.ts";
import { createUserService, IUserService } from "modules/users/user.service.ts";
import { createUserController, IUserController } from "modules/users/user.controller.ts";
import createUserRouter from "modules/users/user.routes.ts";
import createAPI from "app.ts";
import { verifyJwt } from "middleware/verifyJwt.ts";
import { createShopRepository, IShopRepository } from "modules/shops/shop.repository.ts";

type Cradle = {
    db: PrismaClient;
    baseLogger: Logger;
    httpLogger: HttpLogger;
    app: Express;
    tokenVerificationMiddleware: RequestHandler
    
    userService: IUserService;

    userController: IUserController;
    
    userRepo: IUserRepository;
    shopRepo: IShopRepository;

    userRouter: Router;
}

export default function createDiContainer (): AwilixContainer<Cradle> {
    const container = createContainer<Cradle>();
    
    container.register({
        db: asValue(prisma),
        baseLogger: asValue(logger),
        httpLogger: asValue(httpLogger),
        app: asFunction(createAPI).singleton(),

        tokenVerificationMiddleware: asValue(verifyJwt),

        userService: asFunction(createUserService).scoped(),
        
        userController: asFunction(createUserController).scoped(),
        
        userRepo: asFunction(createUserRepository).scoped(),
        shopRepo: asFunction(createShopRepository).scoped(),
        
        userRouter: asFunction(createUserRouter).scoped(),
    });

    return container;
};

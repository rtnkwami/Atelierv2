import { createContainer, asFunction, asValue, AwilixContainer } from "awilix";
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
import { createShopService, IShopService } from "modules/shops/shop.service.ts";
import { createInventoryRepository, IInventoryRepository } from "modules/inventory/inventory.repository.ts";
import { createInventoryService, IInventoryService } from "modules/inventory/inventory.service.ts";
import createShopRouter from "modules/shops/shop.routes.ts";

type Cradle = {
    db: PrismaClient;
    baseLogger: Logger;
    httpLogger: HttpLogger;
    app: Express;
    tokenVerificationMiddleware: RequestHandler
    
    userService: IUserService;
    shopService: IShopService;
    inventoryService: IInventoryService;

    userController: IUserController;
    
    userRepo: IUserRepository;
    shopRepo: IShopRepository;
    inventoryRepo: IInventoryRepository;

    userRouter: Router;
    shopRouter: Router;
}

export default function createDiContainer (): AwilixContainer<Cradle> {
    const container = createContainer<Cradle>();

    const prisma = new PrismaClient();
    
    container.register({
        db: asValue(prisma),
        baseLogger: asValue(logger),
        httpLogger: asValue(httpLogger),
        app: asFunction(createAPI).singleton(),

        tokenVerificationMiddleware: asValue(verifyJwt),

        userService: asFunction(createUserService).scoped(),
        shopService: asFunction(createShopService).scoped(),
        inventoryService: asFunction(createInventoryService).scoped(),
        
        userController: asFunction(createUserController).scoped(),
        
        userRepo: asFunction(createUserRepository).scoped(),
        shopRepo: asFunction(createShopRepository).scoped(),
        inventoryRepo: asFunction(createInventoryRepository).scoped(),
        
        userRouter: asFunction(createUserRouter).scoped(),
        shopRouter: asFunction(createShopRouter).scoped()
    });

    return container;
};

import { createContainer, asFunction, asValue } from "awilix";
import { prisma } from "@config/db.config";
import { createUserRepository } from "modules/users/user.repository";
import { createAuthService } from "@auth/auth.service";
import { createAuthController } from "@auth/auth.controller";
import { createUserService } from "modules/users/user.service";
import { createUserController } from "modules/users/user.controller";
import { createAuthRouter } from "@auth/auth.routes";
import createAPI from "app";
import { httpLogger } from "@config/logger.config";

export default function createDiContainer () {
    const container = createContainer();
    
    container.register({
        db: asValue(prisma),
        httpLogger: asValue(httpLogger),
        authService: asFunction(createAuthService).scoped(),
        authController: asFunction(createAuthController).scoped(),
        authRouter: asFunction(createAuthRouter).singleton(),
        userRepo: asFunction(createUserRepository).scoped(),
        userService: asFunction(createUserService).scoped(),
        userController: asFunction(createUserController).scoped(),
        app: asFunction(createAPI).singleton()
    });

    return container;
};

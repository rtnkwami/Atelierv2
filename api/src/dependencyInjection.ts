import { createContainer, asFunction, asValue } from "awilix";
import { prisma } from "@config/db.config";
import { createUserRepository } from "modules/users/user.repository";
import { createAuthService } from "@auth/auth.service";
import { createAuthController } from "@auth/auth.controller";
import { createUserService } from "modules/users/user.service";
import { createUserController } from "modules/users/user.controller";
import { createAuthRouter } from "@auth/auth.routes";
import { createApp } from "app";

const container = createContainer();

container.register({
    db: asValue(prisma),
    authService: asFunction(createAuthService).scoped(),
    authController: asFunction(createAuthController).scoped(),
    authRouter: asFunction(createAuthRouter).singleton(),
    userRepo: asFunction(createUserRepository).scoped(),
    userService: asFunction(createUserService).scoped(),
    userController: asFunction(createUserController).scoped(),
    app: asFunction(createApp).singleton()
});


export default container;
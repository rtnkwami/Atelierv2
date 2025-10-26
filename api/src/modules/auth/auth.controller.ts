import { Request, Response } from "express";
import { IAuthService } from "./auth.service";
import logger from "@config/logger.config";
import { IUserService } from "modules/users/user.service";

export interface IAuthController {
    register: (req: Request, res: Response) => Promise<Response>;
}

type dependencies = {
    authService: IAuthService,
    userService: IUserService
}

const authControllerLogger = logger.child({ module: 'auth', layer: 'controller' });

export const createAuthController = ({ userService, authService }: dependencies): IAuthController => ({
    register: async (req, res) => {
        try {
            const user = await authService.register(req.user);
            return res.status(200).json(user);
        } catch (error) {
            authControllerLogger.error({ error })
            return res.status(500).json({ error: 'Error registering user' });
        }
    }
});
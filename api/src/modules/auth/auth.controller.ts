import { Request, Response } from "express";
import { IAuthRepository } from "./auth.repository";
import logger from "@config/logger.config";

interface IAuthController {
    permissions: {
        create: (req: Request, res: Response) => Promise<Response>;
        // list: (req: Request, res: Response) => Promise<Response>;
        // update: (req: Request, res: Response) => Promise<Response>;
        // delete: (req: Request, res: Response) => Promise<Response>;
    }
}

const authControllerLogger = logger.child({ module: 'auth', layer: 'controller' });

export const createAuthController = (authRepo: IAuthRepository): IAuthController => ({
    permissions: {
        create: async (req, res) => {
            try {                
                const permissionToCreate = req.body.permission;
                const newPermission = await authRepo.permissions.create(permissionToCreate);

                return res.status(201).json(newPermission)
            } catch (error) {
                authControllerLogger.error({ error });
                return res.status(500).json({ error });
            }
        },
    }
});
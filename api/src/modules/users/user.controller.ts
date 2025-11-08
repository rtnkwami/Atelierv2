import { Request, Response } from "express";
import { IUserService } from "./user.service.ts";
import { Logger } from "pino";

export interface IUserController {
    syncAuthNUsertoDb: (req: Request, res: Response) => Promise<Response>;
    upgradeUserToSeller: (req: Request, res: Response) => Promise<Response>;
}

type dependencies = {
    userService: IUserService,
    baseLogger: Logger
}


export const createUserController = ({ userService, baseLogger }: dependencies): IUserController => {
    const userControllerLogger = baseLogger.child({ module: 'user', layer: 'controller' });

    return {
        syncAuthNUsertoDb: async (req, res) => {
            const authNUserSyncTask = await userService.getOrCreateUser(req.user);
            
            if (authNUserSyncTask.isErr) {
                userControllerLogger.error({ error: authNUserSyncTask.error }, 'Error syncing user to database');
                return res.status(500).json({error: 'Error syncing user to database' })
            }
            userControllerLogger.info('User synced to database');
            return res.sendStatus(200)
        },
        upgradeUserToSeller: async (req, res) => {
            const result = await userService.upgradeUserToSeller(req.user);

            if (result.isErr) {
                userControllerLogger.error({ error: result.error }, 'Error upgrading user to seller');
                return res.status(500).json({ error: 'Error upgrading user to seller' });
            }
            userControllerLogger.info('User upgraded as a seller');
            return res.sendStatus(200)
        }
    }

};
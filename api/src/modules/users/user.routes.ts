import { RequestHandler, Router } from "express"
import { IUserController } from "./user.controller.ts"

type dependencies = {
    userController: IUserController;
    tokenVerificator: RequestHandler;
}

export default function createUserRouter ({ userController, tokenVerificator }: dependencies){
    const router = Router();

    router.use(tokenVerificator);

    router.post('/me', userController.syncAuthNUsertoDb);
    router.post('/me/seller', userController.upgradeUserToSeller)

    return router;
}
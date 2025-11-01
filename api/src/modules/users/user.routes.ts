import { RequestHandler, Router } from "express"
import { IUserController } from "./user.controller.ts"

type dependencies = {
    userController: IUserController;
    tokenVerificationMiddleware: RequestHandler;
}

export default function createUserRouter ({ userController, tokenVerificationMiddleware }: dependencies){
    const router = Router();

    router.use(tokenVerificationMiddleware);

    router.post('/me', userController.syncAuthNUsertoDb)

    return router;
}
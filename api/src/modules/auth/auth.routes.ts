import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { IAuthController } from "./auth.controller";
// import { validate } from "../../utils/validateRequest";
// import authSchema from "./validation/auth.validation";

type dependencies = {
    authController: IAuthController
}

export function createAuthRouter({ authController }: dependencies) {
    const router = Router();
    
    // router.use(verifyJwt);

    router.get('/register',
        verifyJwt,
        authController.register
    )
    // // router.post('/permissions')
    // // router.get('/permissions/:id');
    // // router.put('/permissions/:id');
    // // router.delete('/permissions/:id');

    return router;
}
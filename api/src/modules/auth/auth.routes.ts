import { Router } from "express";
// import { verifyJwt } from "../../middleware/verifyJwt";
import {IAuthController } from "./auth.controller";
import { validate } from "../../utils/validateRequest";
import authSchema from "./validation/auth.validation";

export function createAuthRouter(authController: IAuthController) {
    const router = Router();
    
    // router.use(verifyJwt);
    
    router.post('/permissions',
        validate(authSchema.createPermissionSchema),
        authController.permissions.create
    );
    
    // // router.post('/permissions')
    // // router.get('/permissions/:id');
    // // router.put('/permissions/:id');
    // // router.delete('/permissions/:id');

    return router;
}
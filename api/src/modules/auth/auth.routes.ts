import { Router } from "express";
// import { verifyJwt } from "../../middleware/verifyJwt";
import { createAuthController } from "./auth.controller";
import { createAuthRepository } from "./auth.repository";
import { prisma } from "@config/db.config";
import { validate } from "utils/validateRequest";
import authSchema from "./validation/auth.validation";

const router = Router();

const authRepo = createAuthRepository(prisma);
const authController = createAuthController(authRepo);

// router.use(verifyJwt);

router.post('/permissions',
    validate(authSchema.createPermissionSchema),
    authController.permissions.create
);

// // router.post('/permissions')
// // router.get('/permissions/:id');
// // router.put('/permissions/:id');
// // router.delete('/permissions/:id');

export default router;
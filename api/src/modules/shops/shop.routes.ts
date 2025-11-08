import { RequestHandler, Router } from "express";
import { IShopController } from "./shop.controller.ts"

type dependencies = {
    shopController: IShopController;
    tokenVerificationMiddleware: RequestHandler
}

export default function createShopRouter ({ shopController, tokenVerificationMiddleware }: dependencies) {
    const router = Router();

    router.use(tokenVerificationMiddleware);

    router.get('/me', shopController.getMyShop);

    return router;
}
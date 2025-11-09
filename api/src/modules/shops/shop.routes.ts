import { RequestHandler, Router } from "express";
import { IShopController } from "./shop.controller.ts"
import { shopRequestSchema } from "./validation/shop.validation.ts";
import { validate } from "middleware/validateRequest.ts";

type dependencies = {
    shopController: IShopController;
    tokenVerificator: RequestHandler
}

export default function createShopRouter ({ shopController, tokenVerificator }: dependencies) {
    const router = Router();

    router.get('/:id', shopController.getAShop);
    
    router.use(tokenVerificator);

    router.get('/me', shopController.getMyShop);
    router.put('/me',
        validate(shopRequestSchema.UpdateShopInfoSchema),
        shopController.updateMyShopInfo
    );
    router.delete('/me', shopController.deleteMyShop);
       
    // Shop Inventory
    router.post('/me/products',
        validate(shopRequestSchema.CreateProductFieldsSchema), 
        shopController.createProduct
    )

    return router;
}
import { Logger } from "pino";
import { CreateProductFields, IInventoryRepository } from "./inventory.repository.ts"
import { ProductCreationError } from "error.ts";
import Task from "true-myth/task";
import { Products } from "@db-client/client.ts";
import { IShopRepository } from "modules/shops/shop.repository.ts";

export interface IInventoryService {
    createProductForShop: (sellerId: string, productData: CreateProductFields) => Task<Products, ProductCreationError>
}

type dependencies = {
    inventoryRepo: IInventoryRepository;
    shopRepo: IShopRepository;
    baseLogger: Logger;
}

export const createInventoryService = ({ inventoryRepo, baseLogger, shopRepo }: dependencies): IInventoryService => {
    const inventoryServiceLogger = baseLogger.child({ module: "inventory", layer: "service" });

    return {
        createProductForShop: (sellerId, productData) => {
            return shopRepo.getSellerShop(sellerId)
                .andThen((shop) => inventoryRepo.createProduct(shop.id, productData))
                .mapRejected((reason) => {
                    inventoryServiceLogger.error(reason, `Error creating product for seller ${ sellerId }`)
                    return new ProductCreationError('Error creating product for shop',  { cause: reason });
                })
        },
        
            
    }

}
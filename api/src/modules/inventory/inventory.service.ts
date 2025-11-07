import { Logger } from "pino";
import { CreateProductFields, IInventoryRepository } from "./inventory.repository.ts"
import { ProductCreationError } from "error.ts";
import Task from "true-myth/task";
import { Products } from "@db-client/client.ts";
import { IShopService } from "modules/shops/shop.service.ts";

export interface IInventoryService {
    createProductForShop: (sellerId: string, productData: CreateProductFields) => Task<Products, ProductCreationError>
}

type dependencies = {
    inventoryRepo: IInventoryRepository;
    shopService: IShopService
    baseLogger: Logger;
}

export const createInventoryService = ({ inventoryRepo, baseLogger, shopService }: dependencies): IInventoryService => {
    const inventoryServiceLogger = baseLogger.child({ module: "inventory", layer: "service" });

    return {
        createProductForShop: (sellerId, productData) => {
            return shopService.getShopForSeller(sellerId)
                .andThen((shop) => inventoryRepo.createProduct(shop.id, productData))
                .mapRejected((reason) => {
                    inventoryServiceLogger.error(reason, `Error creating product for seller ${ sellerId }`)
                    return new ProductCreationError('Error creating product for shop',  { cause: reason });
                })
        },

            
    }

}
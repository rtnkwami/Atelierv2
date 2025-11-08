import { Logger } from "pino";
import { IInventoryRepository } from "./inventory.repository.ts"
import { ServiceError } from "error.ts";
import Task from "true-myth/task";
import { Products } from "@db-client/client.ts";
import { CreateProductFields } from "modules/shops/validation/shop.validation.ts";

export interface IInventoryService {
    createShopProduct: (shopId: string, productData: CreateProductFields) => Task<Products, ServiceError>;
    // getShopProducts: (filter: Partial<ProductSearchFilters>) => Task<Products[], ServiceError>
}

type dependencies = {
    inventoryRepo: IInventoryRepository;
    baseLogger: Logger;
}

export const createInventoryService = ({ inventoryRepo, baseLogger }: dependencies): IInventoryService => {
    const inventoryServiceLogger = baseLogger.child({ module: "inventory", layer: "service" });

    return {
        // Internal fn
        createShopProduct: (shopId, productData) => {
            return inventoryRepo.createProduct(shopId, productData)
                .mapRejected((reason) => {
                    inventoryServiceLogger.error(reason, `Error creating product for seller ${ shopId }`)
                    return new ServiceError('Error creating product for shop',  { cause: reason });
                })
        },
            
    }

}
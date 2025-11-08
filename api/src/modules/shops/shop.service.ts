import { Logger } from "pino"
import { IShopRepository } from "./shop.repository.ts"
import { Products, Shops } from "@db-client/client.ts"
import Task from "true-myth/task"
import { NonExistentShopError, NotFoundError, ServiceError, ShopCreationError } from "error.ts"
import { DecodedIdToken } from "firebase-admin/auth"
import { generateDefaultShopName } from "@utils/defaultNames.ts"
import { IInventoryService } from "modules/inventory/inventory.service.ts"
import { CreateProductFields } from "./validation/shop.validation.ts"

export interface IShopService {
    createShopForUser: (userData: DecodedIdToken) => Task<Shops, ShopCreationError>;
    getShopForSeller: (sellerId: string) => Task<Shops, NonExistentShopError | ServiceError>;
    createProductForShop: (sellerId: string, productData: CreateProductFields) => Task<Products, ServiceError>
}

type dependencies = {
    shopRepo: IShopRepository;
    inventoryService: IInventoryService;
    baseLogger: Logger
}

export const createShopService = ({ shopRepo, inventoryService, baseLogger }: dependencies): IShopService => {
    const shopServiceLogger = baseLogger.child({ module: 'shops', layer: 'service' });
    
    return {
        // Internal function (for now)
        createShopForUser: (userData) => {
            const shopName = userData.email ?? generateDefaultShopName();

            const shopData = {
                name: shopName,
                description: '',
            }

            return shopRepo.createShop(userData.uid, shopData)
                .mapRejected(reason => {
                    shopServiceLogger.error({ reason }, `Error creating shop for user "${ userData.uid }"`)
                    return new ShopCreationError('Error creating shop', { cause: reason });
                })
        },
        
        getShopForSeller: (sellerId) => {
            return shopRepo.getSellerShop(sellerId)
                .mapRejected(reason => {
                    if (reason instanceof NotFoundError) {
                        shopServiceLogger.info(`User ${sellerId} tried to access unauthorized shop`);
                        return new NonExistentShopError('Error getting shop', { cause: reason });
                    }
                    shopServiceLogger.error(reason, `Error getting shop for user ${sellerId}`);
                    return new ServiceError('Error getting shop for seller', { cause: reason })
                })
        },

        createProductForShop: (sellerId, productData) => {
            return shopRepo.getSellerShop(sellerId)
                .andThen((shop) => inventoryService.createShopProduct(shop.id, productData))
                .mapRejected((reason) => {
                    shopServiceLogger.error(reason, `Error creating product for shop`)
                    return new ServiceError('Error creating product for shop', { cause: reason });
                })
        }
    }
}
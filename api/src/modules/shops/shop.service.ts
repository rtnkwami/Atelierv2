import { Logger } from "pino"
import { IShopRepository } from "./shop.repository.ts"
import { Products, Shops } from "@db-client/client.ts"
import Task from "true-myth/task"
import { DatabaseError, NonExistentShopError, NotFoundError, ServiceError } from "error.ts"
import { DecodedIdToken } from "firebase-admin/auth"
import { generateDefaultShopName } from "@utils/defaultNames.ts"
import { IInventoryService } from "modules/inventory/inventory.service.ts"
import { CreateProductFields, UpdateShopInfoSchema } from "./validation/shop.validation.ts"

export interface IShopService {
    getAShop: (shopId: string) => Task<Shops, NotFoundError | DatabaseError>;
    createShopForUser: (userData: DecodedIdToken) => Task<Shops, DatabaseError>;
    getShopForSeller: (sellerId: string) => Task<Shops, NonExistentShopError | DatabaseError>;
    updateShopInfo: (sellerId: string, shopData: UpdateShopInfoSchema) => Task<Shops, DatabaseError>;
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
        getAShop: (shopId) => {
            return shopRepo.getShop(shopId)
                .mapRejected(reason => reason);
        },
        
        // Internal function (for now)
        createShopForUser: (userData) => {
            const shopName = userData.email ?? generateDefaultShopName();

            const shopData = {
                name: shopName,
                description: '',
            }

            return shopRepo.createShop(userData.uid, shopData)
                .mapRejected(reason => {
                    shopServiceLogger.error(reason, `Error creating shop for user "${ userData.uid }"`)
                    return reason;
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
                    return reason;
                })
        },

        updateShopInfo: (sellerId, shopData) => {
            return shopRepo.getSellerShop(sellerId)
                .andThen((shop) => shopRepo.updateShop(shop.id, shopData))
                .mapRejected((reason) => {
                    shopServiceLogger.error(reason, `Error updating shop info for user ${ sellerId }`)
                    return reason;
                })
        },

        createProductForShop: (sellerId, productData) => {
            return shopRepo.getSellerShop(sellerId)
                .andThen((shop) => inventoryService.createShopProduct(shop.id, productData))
                .mapRejected((reason) => {
                    shopServiceLogger.error(reason, `Error creating product for shop`)
                    return reason;
                })
        }
    }
}
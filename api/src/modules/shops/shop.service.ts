import { Logger } from "pino"
import { IShopRepository } from "./shop.repository.ts"
import { Shops } from "@db-client/client.ts"
import Task from "true-myth/task"
import { NonExistentShopError, ShopCreationError } from "error.ts"
import { DecodedIdToken } from "firebase-admin/auth"
import { generateDefaultShopName } from "@utils/defaultNames.ts"

export interface IShopService {
    createShopForUser: (userData: DecodedIdToken) => Task<Shops, ShopCreationError>;
    getSellerShop: (userId: string) => Task<Shops, NonExistentShopError>;
}

type dependencies = {
    shopRepo: IShopRepository,
    baseLogger: Logger
}

export const createShopService = ({ shopRepo, baseLogger }: dependencies): IShopService => {
    const shopServiceLogger = baseLogger.child({ module: 'shops', layer: 'service' });
    
    return {
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
        
        getSellerShop: (sellerId) => {
            return shopRepo.getSellerShop(sellerId)
                .mapRejected(reason => {
                    return new NonExistentShopError('Error getting shop', { cause: reason })
                })
        }
    }
}
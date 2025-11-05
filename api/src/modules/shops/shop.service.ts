import { Logger } from "pino"
import { IShopRepository } from "./shop.repository.ts"
import { Shops } from "@db-client/client.ts"
import Task from "true-myth/task"
import { ShopCreationError } from "error.ts"
import { DecodedIdToken } from "firebase-admin/auth"
import { generateDefaultShopName } from "@utils/defaultNames.ts"

export interface IShopService {
    createShopForUser: (userData: DecodedIdToken) => Task<Shops, ShopCreationError>;
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
            
        }
    }
}
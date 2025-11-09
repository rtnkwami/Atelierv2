import { PrismaClient, Shops } from "@db-client/client.ts"
import { getTxOrDbClient } from "async.context.ts";
import { DatabaseError, NotFoundError } from "error.ts"
import { Logger } from "pino";
import Task, { tryOrElse } from 'true-myth/task'
import { CreateShopSchema, UpdateShopInfoSchema } from "./validation/shop.validation.ts";


export interface IShopRepository {
    createShop: (userId: string, shopData: CreateShopSchema) => Task<Shops, DatabaseError>;
    getShop: (shopId: string) => Task<Shops, NotFoundError | DatabaseError>;
    getSellerShop: (sellerId: string) => Task<Shops, NotFoundError | DatabaseError>;
    updateShop: (shopId: string, shopUpdateData: UpdateShopInfoSchema) => Task<Shops, DatabaseError>;
    deleteShop: (shopId: string) => Task<Shops, DatabaseError>;
}

type dependencies = {
    db: PrismaClient;
    baseLogger: Logger;
}

export const createShopRepository = ({ db, baseLogger }: dependencies): IShopRepository => {
    const shopRepoLogger = baseLogger.child({ module: "shops", layer: "repository"});
 
    return {
        createShop: (userId, shopData) =>
            tryOrElse(
                (reason) => new DatabaseError('Error creating shop', { cause: reason }),
                async () => {
                    const client = getTxOrDbClient(db);
                    const shop = await client.shops.create({
                        data: {
                            name: shopData.name,
                            description: shopData.description,
                            user: {
                                connect: { id: userId }
                            }
                        },
                    });

                    return shop;
                }
            ),
        getShop: (shopId) =>
            tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) {
                        return reason;
                    }
                    return new DatabaseError(`Error getting shop "${ shopId }"`, { cause: reason });
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const shop = await client.shops.findUnique({
                        where: {
                            id: shopId
                        }
                    });

                    if (!shop) {
                        throw new NotFoundError(`Shop "${ shopId }" does not exist`);
                    }
                    return shop;
                }
            ),
        getSellerShop: (sellerId) =>
            tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) {
                        return reason;
                    }
                    shopRepoLogger.error(reason, `Error getting shop for seller "${ sellerId } "`);
                    return new DatabaseError(`Error getting shop for seller "${ sellerId }"`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const shop = await client.shops.findUnique({
                        where: {
                            usersId: sellerId
                        }
                    });

                    if (!shop) {
                        throw new NotFoundError(`Shop does not exist for seller ${ sellerId }`);
                    }
                    return shop;
                }
            ),
        updateShop: (shopId, shopUpdateData) =>
            tryOrElse(
                (reason) => new DatabaseError('Error updating shop information', { cause: reason }),
                async () => {
                    
                    const dataClause = {
                        ...(shopUpdateData?.name && { name: shopUpdateData.name }),
                        ...(shopUpdateData?.description && { description: shopUpdateData.description })
                    }
                    
                    const client = getTxOrDbClient(db);
                    const updatedShopInfo = client.shops.update({
                        where: {
                            id: shopId
                        },
                        data: dataClause
                    });

                    return updatedShopInfo;
                }
            ),
        deleteShop: (shopId) =>
            tryOrElse(
                (reason) => {
                    shopRepoLogger.error(reason, `Error deleting shop ${ shopId }`);
                    return new DatabaseError('Error deleting shop');
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const deletedShop = await client.shops.delete({
                        where: {
                            id: shopId
                        }
                    });
                    return deletedShop;
                }
            )
    }

}
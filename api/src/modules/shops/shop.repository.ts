import { PrismaClient, Shops } from "@db-client/client.ts"
import { DatabaseError, NotFoundError } from "error.ts"
import Task, { tryOrElse } from 'true-myth/task'

type CreateShopDto = {
    name: string;
    description: string;
}

export interface IShopRepository {
    createShop: (userId: string, shopData: CreateShopDto) => Task<Shops, DatabaseError>;
    getShop: (shopId: string) => Task<Shops, NotFoundError | DatabaseError>;
}


type dependencies = {
    db: PrismaClient;
}

export const createShopRepository = ({ db }: dependencies): IShopRepository => ({
    createShop: (userId, shopData) =>
        tryOrElse(
            (reason) => new DatabaseError('Error creating shop', { cause: reason }),
            async () => {
                const shop = await db.shops.create({
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
                const shop = await db.shops.findUnique({
                    where: {
                        id: shopId
                    }
                });

                if (!shop) {
                    throw new NotFoundError(`Shop "${ shopId }" does not exist`);
                }
                return shop;
            }
        )
})
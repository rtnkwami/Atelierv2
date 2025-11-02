import { PrismaClient, Shops } from "@db-client/client.ts"
import { DatabaseError } from "error.ts"
import Task, { tryOrElse } from 'true-myth/task'

type CreateShopDto = {
    name: string;
    description: string;
}

export interface IShopRepository {
    createShop: (userId: string, shopData: CreateShopDto) => Task<Shops, DatabaseError>;
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
        )        
})
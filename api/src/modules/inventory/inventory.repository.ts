import { PrismaClient, Products } from "@db-client/client.ts"
import { getTxOrDbClient } from "async.context.ts";
import { DatabaseError, NotFoundError } from "error.ts";
import { Logger } from "pino";
import { Task } from "true-myth";
import { tryOrElse } from "true-myth/task";

export interface IInventoryRepository {
    shops: {
        createProduct: (shopId: string, productData: {
            name: string;
            short_description: string;
            long_description: string;
            category: string;
            price: number;
            stock: number;
            images?: string[];
        }) => Task<Products, DatabaseError>;
        getUniqueProduct: (productId: string) => Task<Products, NotFoundError | DatabaseError>;
    }
}

type dependencies = {
    db: PrismaClient;
    baseLogger: Logger;
}


export const createInventoryRepository = ({ db, baseLogger }: dependencies): IInventoryRepository => {
    const inventoryRepoLogger = baseLogger.child({ module: 'inventory', layer: 'repository' });

    return {
        shops: {
            createProduct: (shopId, productData) => tryOrElse(
                (reason) => {
                    inventoryRepoLogger.error({ error: reason }, 'Error creating product for shop')
                    return new DatabaseError(`Error creating product for shop ${shopId}`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    return client.products.create({
                        data: {
                            name: productData.name,
                            short_description: productData.short_description ?? '',
                            long_description: productData.long_description ?? '',
                            category: productData.category,
                            price: productData.price,
                            stock: productData.stock ?? 0,
                            images: productData.images ?? [],

                            shopsId: shopId
                        },
                    })
                }
            ),
            getUniqueProduct: (productId) => tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) {
                        return reason;
                    }
                    return new DatabaseError(`Error getting product "${ productId }"`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const product = await client.products.findUnique({
                        where: { id: productId }
                    });

                    if (!product) {
                        throw new NotFoundError(`Product "${ productId }" does not exist`)
                    }
                    return product;
                }
            )
        }
    }
}
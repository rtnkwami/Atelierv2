import { PrismaClient, Products } from "@db-client/client.ts"
import { QueryMode } from "@db-client/internal/prismaNamespace.ts";
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
        getUniqueProduct: (productId: string, shopId?: string) => Task<Products, NotFoundError | DatabaseError>;
        getProducts: (filter?: Partial<{
            name: string;
            category: string;
            price: { min: number; max: number };
            stock: { min: number; max: number };
            date: { from: Date, to: Date };
            shopId: string
        }>, pagination?: {
            offset: number;
            limit: number;
        }) => Task<Products[], NotFoundError | DatabaseError>;
        updateProduct: (productId: string, updateData: Partial<Products>) => Task<Products, DatabaseError>;
        deleteProduct: (productId: string) => Task<Products, DatabaseError>
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
                    inventoryRepoLogger.error(reason, 'Error creating product for shop')
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
            getUniqueProduct: (productId, shopId) => tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) {
                        return reason;
                    }
                    inventoryRepoLogger.error(reason, `Error getting product "${ productId }"`)
                    return new DatabaseError(`Error getting product "${ productId }"`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const product = await client.products.findUnique({
                        where: { 
                            id: productId,
                            ...(shopId && { shopsId: shopId })
                        }
                    });

                    if (!product) {
                        throw new NotFoundError(`Product "${ productId }" does not exist`)
                    }
                    return product;
                }
            ),
            getProducts: (filter, pagination) => tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) {
                        return reason;
                    }
                    inventoryRepoLogger.error(reason, 'Error getting products');
                    return new DatabaseError(`No products found for current filter ${ filter }`);
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    let productList: Products[];

                    if (!filter) {
                        productList = await client.products.findMany();
                    }

                    /** If you see something like ...(filter?.attribute && { attribute: filter.attribute }),
                     * it means the same thing as if (filter?.attribute) { whereClause.attribute = filter.attribute }
                     * 
                     * This syntax is simply there to make the code less verbose.
                     */
                    const whereClause = {
                        ...(filter?.name && { 
                            name: { contains: filter.name, mode: 'insensitive' as QueryMode }
                        }),
                        ...(filter?.category && { category: filter.category }),
                        ...(filter?.price && {
                            price: { gte: filter.price.min, lte: filter.price.max },
                        }),
                        ...(filter?.stock && {
                            stock: { gte: filter.stock.min, lte: filter.stock.max }
                        }),
                        ...(filter?.date && {
                            createdAt: { gte: filter.date.from, lte: filter.date.to },
                        }),
                        ...(filter?.shopId && { shopsId: filter.shopId })
                        };

                    productList = await client.products.findMany({
                        where: whereClause,
                        ...(pagination?.offset !== undefined && { skip: pagination.offset }),
                        ...(pagination?.limit !== undefined && { take: pagination.limit }),
                    })

                    if (productList.length === 0) {
                        throw new NotFoundError('No products found for current filter');
                    }

                    return productList;
                }
            ),
            updateProduct: (productId, productData) => tryOrElse(
                (reason) => {
                    inventoryRepoLogger.error(reason, `Error updating product "${ productId }"`);
                    return new DatabaseError(`Error updating product "${ productId }"`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const updatedProduct = await client.products.update({
                        where: {
                            id: productId
                        },
                        data: productData
                    })

                    return updatedProduct;
                }
            ),
            deleteProduct: (productId) => tryOrElse(
                (reason) => {
                    inventoryRepoLogger.error(reason, `Error deleting product "${ productId }"`);
                    return new DatabaseError(`Error deleting product ${ productId }`, { cause: reason })
                },
                async () => {
                    const client = getTxOrDbClient(db);
                    const deletedProduct = await client.products.delete({
                        where: {
                            id: productId
                        }
                    });

                    return deletedProduct;
                }
            )
        }
    }
}
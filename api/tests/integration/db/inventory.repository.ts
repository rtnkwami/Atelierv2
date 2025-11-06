import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe, vi } from 'vitest'
import { mockDecodedIdToken } from '../../mocks/firebase.mocks.ts';
import { Shops } from '@db-client/client.ts';
import { mockProduct } from '../../mocks/product.ts';

describe('Inventory Tests', () => {
    const container = createDiContainer();
    const { db, inventoryRepo, userService } = container.cradle;

    beforeEach(async () => {
        await resetDb(db);
    })

    afterAll(async () => {
        await db.$disconnect();
    })

    describe('Shop Inventory', () => {
        let shop: Shops;

        beforeEach(async () => {
           const task = await userService.getOrCreateUser(mockDecodedIdToken)
                .andThen(() => userService.upgradeUserToSeller(mockDecodedIdToken))
                .map(([_, shop]) => shop);
            
            if (task.isOk) { shop = task.value };
        })

        it('should create products', async () => {
            const task = await inventoryRepo.shops.createProduct(shop.id, mockProduct);
            
            task.match({
                Ok: (product) => {
                    expect(product.name).toBe(mockProduct.name);
                    expect(product.price).toBe(mockProduct.price)
                    expect(product.category).toBe(mockProduct.category)
                } ,
                Err: () => expect.fail('Task should have succeeded')
            })
        })
    })
})
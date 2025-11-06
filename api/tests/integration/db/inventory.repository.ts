import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe } from 'vitest'
import { mockDecodedIdToken } from '../../mocks/firebase.mocks.ts';
import { Shops } from '@db-client/client.ts';
import { mockProduct } from '../../mocks/product.ts';
import { NotFoundError } from 'error.ts';
import { randomUUID } from 'crypto';

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
                Err: (error) => { 
                    console.log(error)
                    expect.fail('Task should have succeeded')
                }
            });
        })

        it('should get a unique product', async () => {
            const task = await inventoryRepo.shops.createProduct(shop.id, mockProduct)
                .andThen((product) => inventoryRepo.shops.getUniqueProduct(product.id));

            task.match({
                Ok: (product) => {
                    expect(product.name).toBe(mockProduct.name);
                    expect(product.price).toBe(mockProduct.price)
                    expect(product.category).toBe(mockProduct.category)
                },
                Err: (error) =>{
                    console.log(error);
                    expect.fail('Task should have succeeded')
                }
            })
        });

        it('should throw an error if the product does not exist', async () => {
            const randomId = randomUUID();
            const task = await inventoryRepo.shops.getUniqueProduct(randomId);

            task.match({
                Ok: () => expect.fail('Task should have failed'),
                Err: (error) => {
                    expect(error).toBeInstanceOf(NotFoundError);
                }
            })
        })
    })
})
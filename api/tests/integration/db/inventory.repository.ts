import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe, afterEach } from 'vitest'
import { mockDecodedIdToken } from '../../mocks/firebase.mocks.ts';
import { Products, Shops } from '@db-client/client.ts';
import { mockProduct } from '../../mocks/product.ts';
import { NotFoundError } from 'error.ts';
import { randomUUID } from 'crypto';
import { generateFakeProducts } from '@utils/generateFakes.ts';

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
            const task = await inventoryRepo.createProduct(shop.id, mockProduct);
            
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
            const task = await inventoryRepo.createProduct(shop.id, mockProduct)
                .andThen((product) => inventoryRepo.getUniqueProduct(product.id));

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
            const task = await inventoryRepo.getUniqueProduct(randomId);

            task.match({
                Ok: () => expect.fail('Task should have failed'),
                Err: (error) => {
                    expect(error).toBeInstanceOf(NotFoundError);
                }
            })
        })

        describe('Product Listing', () => {
            beforeEach(async () => {
                const fakeProducts = [
                    { name: 'Test Laptop', category: 'Electronics', price: 50, stock: 10 },
                    { name: 'Gaming Mouse', category: 'Electronics', price: 150, stock: 25 },
                    { name: 'Office Chair', category: 'Furniture', price: 200, stock: 5 }
                ]
                
                for (let index = 0; index < fakeProducts.length; index++) {
                    await inventoryRepo.createProduct(
                        shop.id,
                        generateFakeProducts(fakeProducts[index])
                    );
                }
            });

            afterEach(async () => {
                await resetDb(db);
            })

            it('should list all products if no filters are given', async () => {
                const task = await inventoryRepo.getProducts();

                task.match({
                    Ok: (productList) => {
                        expect(productList.length).not.toBe(0);
                        expect(productList[0]).toHaveProperty('name');
                    },
                    Err: (error) => {
                        console.log(error);
                        expect.fail('Task should have succeeded')
                    }
                })
            });

            it('should list products based on a given filter', async () => {
                const testScenarios = [
                    {
                        filter: { name: 'test' },
                        description: 'name filter',
                        assertions: (productList: Products[]) => {
                            expect(productList.length).toBe(1);
                            expect(productList.every(
                                p => p.name.toLowerCase().includes('test'))
                            ).toBe(true);
                        }
                    },
                    {
                        filter: { category: 'Electronics' },
                        description: 'category filter',
                        assertions: (productList: Products[]) => {
                            expect(productList.length).toBe(2);
                            expect(productList.every(
                                p => p.category === 'Electronics')
                            ).toBe(true);
                        }
                    },
                    {
                        filter: { price: { min: 100, max: 250 } },
                        description: 'price filter',
                        assertions: (productList: Products[]) => {
                            expect(productList.length).toBe(2);
                            expect(productList.every(
                                p => p.price >= 100 && p.price <= 250)
                            ).toBe(true);
                        }
                    },
                    {
                        filter: { stock: { min: 5, max: 50 } },
                        description: 'stock filter',
                        assertions: (productList: Products[]) => {
                            expect(productList.length).toBe(3);
                            expect(productList.every(
                                p => p.stock >= 5 && p.stock <= 50)
                            ).toBe(true);
                        }
                    },
                ];

                for (const scenario of testScenarios) {
                    const task = await inventoryRepo.getProducts(scenario.filter);

                    task.match({
                        Ok: (productList) => {
                            scenario.assertions(productList);
                        },
                        Err: (error) => {
                            console.log(error);
                            expect.fail(`Task should have succeeded for ${scenario.description}`);
                        }
                    });
                }
            });

            it('should throw a not found error if no products are returned', async () => {
                await resetDb(db);

                const task = await inventoryRepo.getProducts();

                task.match({
                    Ok: () => expect.fail('Task should have failed'),
                    Err: (error) => expect(error).toBeInstanceOf(NotFoundError)
                })
            })
        })
    })
})
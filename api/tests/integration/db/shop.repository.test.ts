import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe } from 'vitest'
import { mockUser } from '../../mocks/firebase.mocks.ts';
import { DatabaseError, NotFoundError } from 'error.ts';

describe('Shop repository', async () => {
    const container = createDiContainer();
    const { db, shopRepo, userRepo } = container.cradle;

    const shopData = {
        name: 'Test shop',
        description: 'a shop specifically for this test',
    };
    
    beforeEach(async () => {
        await resetDb(db);
        // Each shop integration test needs at least one user within the database due to associations.
        await userRepo.createUser(mockUser); 
    });
    
    afterAll(async () => {
        await db.$disconnect();
    })

    
    describe('shop creation', () => {
        it('should return a created shop', async () => {
            const createShopTask = await shopRepo.createShop(mockUser.id, shopData);

            createShopTask.match({
                Ok: (shop) => {
                    expect(shop.usersId).toEqual(mockUser.id);
                    expect(shop.name).toEqual(shopData.name);
                    expect(shop.description).toEqual(shopData.description);
                },
                Err: (error) => {
                    console.error('Error during shop creation test', error);
                    expect.fail('Task should have returned a created shop');     
                }
            });
        });

        it('should return a database error on failure', async () => {
            const createShopTask = await shopRepo.createShop('nonexistent user id', shopData);

            createShopTask.match({
                Ok: () => { expect.fail('Task should have failed'); },
                Err: (error) => {
                    expect(error).toBeInstanceOf(DatabaseError);
                }
            });
        });
        
        describe('shop listing', () => {
            it('should return a single shop', async () => {
                const findShopTask = await shopRepo.createShop(mockUser.id, shopData)
                    .andThen((shop) => shopRepo.getShop(shop.id))

                findShopTask.match({
                    Ok: (shop) => {
                        expect(shop.name).toBe(shopData.name);
                        expect(shop.description).toBe(shopData.description);
                    },
                    Err: (error) => {
                        console.log('Error during shop listing test', error);
                        expect.fail('Task should have returned a single shop');
                    }
                })
            });

            it('should return a NotFoundError for nonexistent shop', async () => {
                // getShop requires a valid uuid, otherwise test will fail with database error
                const findShopTask = await shopRepo.getShop('f2e6e2c3-0a9b-4fd0-b75a-bc782511a622');

                findShopTask.match({
                    Ok: () => { expect.fail('Should not have found shop'); },
                    Err: (error) => {
                        expect(error).toBeInstanceOf(NotFoundError);
                    }
                });
            })            
        })
    })
});
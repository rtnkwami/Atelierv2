import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe } from 'vitest'
import { mockUser } from '../../mocks/firebase.mocks.ts';
import { DatabaseError, IntegrationTestError } from 'error.ts';

describe('Shop repository', async () => {
    const container = createDiContainer();
    const { db, shopRepo, userRepo } = container.cradle;

    beforeEach(async () => {
        await resetDb(db);
    });
    
    afterAll(async () => {
        await db.$disconnect();
    })

    
    describe('shop creation', () => {
        const shopData = {
            name: 'Test shop',
            description: 'a shop specifically for this test',
        };

        it('should return a created shop', async () => {
            const createShopTask = await userRepo.createUser(mockUser)
                .andThen(() => {
                    return shopRepo.createShop(mockUser.id, shopData)
                })
                .mapRejected(reason => new IntegrationTestError('Error while running test', { cause: reason }));

            createShopTask.match({
                Ok: (shop) => {
                    expect(shop.usersId).toEqual(mockUser.id);
                    expect(shop.name).toEqual(shopData.name);
                    expect(shop.description).toEqual(shopData.description);
                },
                Err: (error) => {
                    console.error('Task failed:', error);
                    
                }
            });
        });

        it('should return a database error on failure', async () => {
            const createShopTask = await shopRepo.createShop('nonexistent user id', shopData);

            createShopTask.match({
                Ok: (shop) => {
                    console.error('Task unexpectedly succeeded with shop:', shop);
                    expect.fail('Task should have failed');
                },
                Err: (error) => {
                    console.log('Expected error:', error);
                    expect(error).toBeInstanceOf(DatabaseError);
                }
            });
        });
    })
});
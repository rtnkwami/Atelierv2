import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import createDiContainer from '../../src/di.ts';
import { Task } from 'true-myth/task';
import { ShopCreationError } from 'error.ts';
import { mockDecodedIdToken, mockUser } from '../mocks/firebase.mocks.ts';
import { Shops } from '@db-client/client.ts';

describe('Shop Service', () => {
    const container = createDiContainer();
    const { shopRepo, shopService } = container.cradle;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    describe('createShopForUser', () => {
        it('should successfully create a shop for a user', async () => {
            const mockShop: Shops = {
                id: 'shop-123',
                name: 'user@example.com',
                description: '',
                usersId: mockUser.id
            };
            vi.spyOn(shopRepo, 'createShop').mockReturnValue(Task.resolve(mockShop));

            const resultTask = await shopService.createShopForUser(mockDecodedIdToken);

            resultTask.match({
                Ok: (shop) => {
                    expect(shop).toEqual(mockShop);
                    expect(shopRepo.createShop).toHaveBeenCalledWith(
                        mockDecodedIdToken.uid,
                        { name: mockDecodedIdToken.email, description: '' }
                    );
                },
                Err: () => expect.fail('Task should have succeeded'),
            });
        });

        it('should return ShopCreationError when creation fails', async () => {
            vi.spyOn(shopRepo, 'createShop')
                .mockReturnValue(Task.reject(new Error('DB write failed')));

            const failedTask = await shopService.createShopForUser(mockDecodedIdToken);

            failedTask.match({
                Ok: () => expect.fail('Task should have failed'),
                Err: (error) => {
                    expect(error).toBeInstanceOf(ShopCreationError);
                }
            });
        });
    });
});

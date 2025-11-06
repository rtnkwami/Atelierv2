import { beforeEach, afterAll, it, expect, describe, vi } from 'vitest';
import createDiContainer from '../../src/di.ts';
import { mockDecodedIdToken } from '../mocks/firebase.mocks.ts';
import { NotFoundError, SellerUpgradeError, UserSyncError } from 'error.ts';
import { Task } from 'true-myth/task';
import { mockUser } from '../mocks/firebase.mocks.ts';
import * as txUtils from 'async.context.ts';

describe('User Service ', () => {
    const container = createDiContainer();
    const { userRepo, userService, shopService } = container.cradle;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.clearAllMocks();
    })

    describe('Authenticated User', () => {
        it('should return a user if they exist', async () => {
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.resolve(mockUser)
            );
            const task = await userService.getOrCreateUser(mockDecodedIdToken);
            
            task.match({
                Ok: (user) => { expect(user).toMatchObject(mockUser) },
                Err: (error) => {
                    console.error('Error during user creation or listing test', error)
                    expect.fail('User should have been synced with db')
                }
            })
        });


        it('should create a user if they do not exist', async () => {            
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new NotFoundError)
            );
            vi.spyOn(userRepo, 'createUser').mockReturnValue(
                Task.resolve(mockUser)
            )
            const task = await userService.getOrCreateUser(mockDecodedIdToken);

            task.match({
                Ok: (user) => { 
                    expect(userRepo.getUser).toHaveBeenCalled()
                    expect(userRepo.createUser).toHaveBeenCalledWith(mockUser);
                    expect(user).toMatchObject(mockUser)
                },
                Err: (error) => {
                    console.error('Failed to sync user to db', error)
                    expect.fail('User should have been synced with db')
                }
            })
        });


        it('should throw a user sync error on failure', async () => {
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new Error('Test Error'))
            );
            const task = await userService.getOrCreateUser(mockDecodedIdToken);

            task.match({
                Ok: () => { expect.fail('Task should have failed.') },
                Err: (error) => { 
                    expect(error).toBeInstanceOf(UserSyncError); }
            });
        })
    })

    describe('Seller Upgrade', async () => {
        it('should upgrade user to a seller and return a shop', async () => {  
            vi.spyOn(userRepo, 'getUser').mockReturnValue(Task.resolve(mockUser));
            vi.spyOn(userRepo, 'getRole').mockReturnValue(Task.resolve({ id: '1', name: 'seller' }));
            vi.spyOn(userRepo, 'assignRoleToUser').mockReturnValue(
                Task.resolve({
                    id: mockUser.id,
                    roles: [
                        { name: 'user' }, { name: 'seller' }
                    ] 
                })
            );
            vi.spyOn(shopService, 'createShopForUser').mockReturnValue(
            Task.resolve({
                id: 'shop-456',
                name: 'DigiMart',
                description: 'Online shop created during seller upgrade',
                usersId: mockUser.id
            })
            );
            vi.spyOn(txUtils, 'runWithTransaction').mockReturnValue(Task.resolve([
                {
                    id: mockUser.id,
                    roles: [
                        { name: 'user' },
                        { name: 'seller' }
                    ]
                },
                {
                    id: 'shop-456',
                    name: 'DigiMart',
                    description: 'Online shop created during seller upgrade',
                    usersId: mockUser.id
                }
            ]))
            
            const sellerUpgradeTask = await userService.upgradeUserToSeller(mockDecodedIdToken);

            sellerUpgradeTask.match({
                Ok: ([userData, shopData]) => {
                    expect(userData).toHaveProperty('id');
                    expect(userData).toHaveProperty('roles');
                    expect(userData.roles).toHaveLength(2);

                    expect(shopData).toHaveProperty('id');
                    expect(shopData).toHaveProperty('name');
                    expect(shopData).toHaveProperty('description');
                },
                Err: (error) => {
                    console.error('Error during seller upgrade', error.cause);
                    expect.fail('Seller upgrade should have succeeded')
                }
            })
        });

        it('should throw an error on internal failure', async () => {
            vi.spyOn(txUtils, 'runWithTransaction')
                .mockReturnValue(Task.reject(new Error('Test Error')));

            const task = await userService.upgradeUserToSeller(mockDecodedIdToken);

            task.match({
                Ok: () => { expect.fail('Task should have failed') },
                Err: (error) => { expect(error).toBeInstanceOf(SellerUpgradeError) }
            })
        })
    })
})
import { beforeEach, afterAll, it, expect, describe, vi } from 'vitest';
import createDiContainer from '../../src/di.ts';
import { mockDecodedIdToken } from '../mocks/firebase.mocks.ts';
import { DatabaseError, NotFoundError, SellerUpgradeError, UserSyncError } from 'error.ts';
import { Task } from 'true-myth/task';
import { mockUser } from '../mocks/firebase.mocks.ts';

describe('User Service ', () => {
    const container = createDiContainer();
    const { userRepo, userService } = container.cradle;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.clearAllMocks();
    })

    describe('authenticated user sync to app db', () => {
        it('should return a user if they exist', async () => {
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.resolve(mockUser)
            );
            const syncUserToDbTask = await userService.getOrCreateUser(mockDecodedIdToken);

            expect(syncUserToDbTask.isOk).toBe(true);
            if (syncUserToDbTask.isOk) {
                expect(syncUserToDbTask.value).toMatchObject(mockUser);
            }
        });


        it('should create a user if they do not exist', async () => {            
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new NotFoundError)
            );
            vi.spyOn(userRepo, 'createUser').mockReturnValue(
                Task.resolve(mockUser)
            )
            const syncUserToDbTask = await userService.getOrCreateUser(mockDecodedIdToken);

            expect(syncUserToDbTask.isOk).toBe(true);
            
            if (syncUserToDbTask.isOk) {
                expect(userRepo.getUser).toHaveBeenCalled()
                expect(userRepo.createUser).toHaveBeenCalledWith(mockUser);
                expect(syncUserToDbTask.value).toMatchObject(mockUser)
            }
        });


        it('should throw a user sync error on failure', async () => {
            vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new Error('Test Error'))
            );
            const syncUserToDbTask = await userService.getOrCreateUser(mockDecodedIdToken);

            expect(syncUserToDbTask.isErr).toBe(true);
            
            if (syncUserToDbTask.isErr){
                expect(syncUserToDbTask.error).toBeInstanceOf(UserSyncError);
            }
        })
    })

    describe('user', async () => {
        const userSyncTask = await userService.getOrCreateUser(mockDecodedIdToken);

        it('should upgrade user to a seller', async () => {            
            if (userSyncTask.isOk) {
                const sellerUpgradeTask = await userService.upgradeUserToSeller(userSyncTask.value.id);
                
                if (sellerUpgradeTask.isOk) {
                    expect(sellerUpgradeTask.value).toHaveProperty('id');
                    expect(sellerUpgradeTask.value).toHaveProperty('roles');
                    expect(sellerUpgradeTask.value.roles).toHaveLength(2);
                }
            }
        });

        it('should return a SellerUpgradeError if the user does not exist', async () => {
            vi.spyOn(userRepo, 'getUser').mockReturnValue(Task.reject(new NotFoundError('User not found')));
            vi.spyOn(userRepo, 'getRole').mockReturnValue(Task.resolve({ id:'123' , name: 'seller' }));

            const result = await userService.upgradeUserToSeller('nonexistent-id');

            expect(result.isErr).toBe(true);
            if (result.isErr) {
                expect(result.error).toBeInstanceOf(SellerUpgradeError);
                expect(result.error.cause).toBeInstanceOf(NotFoundError);
            }
        });

        it('should return a SellerUpgradeError if the seller role does not exist', async () => {
            vi.spyOn(userRepo, 'getUser').mockReturnValue(Task.resolve(mockUser));
            vi.spyOn(userRepo, 'getRole').mockReturnValue(Task.reject(new NotFoundError('Role not found')));

            const result = await userService.upgradeUserToSeller('user123');

            expect(result.isErr).toBe(true);
            if (result.isErr) {
                expect(result.error).toBeInstanceOf(SellerUpgradeError);
                expect(result.error.cause).toBeInstanceOf(NotFoundError);
            }
        });

        it('should return a SellerUpgradeError if assigning the role fails', async () => {
            vi.spyOn(userRepo, 'getUser').mockReturnValue(Task.resolve(mockUser));
            vi.spyOn(userRepo, 'getRole').mockReturnValue(Task.resolve({ id:'1234', name: 'seller' }));
            vi.spyOn(userRepo, 'assignRoleToUser').mockReturnValue(Task.reject(new DatabaseError('Failed')));

            const result = await userService.upgradeUserToSeller('user123');

            expect(result.isErr).toBe(true);
            if (result.isErr) {
                expect(result.error).toBeInstanceOf(SellerUpgradeError);
                expect(result.error.cause).toBeInstanceOf(DatabaseError);
            }
        });
    })
})
import { beforeEach, afterAll, it, expect, describe, vi, beforeAll, expectTypeOf } from 'vitest';
import createDiContainer from '../../src/di.ts';
import { mockDecodedIdToken } from '../mocks/firebase.mocks.ts';
import { NotFoundError, UserSyncError } from 'error.ts';
import { Task } from 'true-myth/task';
import { Users } from '../../prisma-client/client.ts';

describe('User Service ', () => {
    const container = createDiContainer();
    const { userRepo, userService } = container.cradle;

    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterAll(async () => {
        vi.clearAllMocks();
    })

    describe('authenticated user sync to app db', () => {
        const mockUser: Users = {
            id: mockDecodedIdToken.uid,
            name: mockDecodedIdToken.email,
            email: mockDecodedIdToken.email,
            avatar: mockDecodedIdToken.picture
        }

        it('should create a user if they do not exist', async () => {            
            const getUserTaskSpy = vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new NotFoundError)
            );
            const createUserTaskSpy = vi.spyOn(userRepo, 'createUser').mockReturnValue(
                Task.resolve(mockUser)
            )
            const syncUserToDbTask = await userService.getOrCreateUser(mockDecodedIdToken);

            expect(syncUserToDbTask.isOk).toBe(true);
            
            if (syncUserToDbTask.isOk) {
                expect(getUserTaskSpy).toHaveBeenCalled()
                expect(createUserTaskSpy).toHaveBeenCalledWith(mockUser);
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
})
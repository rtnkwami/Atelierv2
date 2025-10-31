import { beforeEach, afterAll, it, expect, describe, vi } from 'vitest';
import createDiContainer from '../../src/di.ts';
import { mockDecodedIdToken } from '../mocks/firebase.mocks.ts';
import { NotFoundError } from 'error.ts';
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
        it('should create a user if they do not exist', async () => {            
            const mockUser: Users = {
                id: mockDecodedIdToken.uid,
                name: mockDecodedIdToken.email,
                email: mockDecodedIdToken.email,
                avatar: mockDecodedIdToken.picture
            }
            
            const getUserTaskSpy = vi.spyOn(userRepo, 'getUser')
                .mockReturnValue(Task.reject(new NotFoundError));
            
            const createUserTaskSpy = await vi.spyOn(userRepo, 'createUser').mockReturnValue(
                Task.resolve(mockUser)
            )
            const syncUserToDbTask = await userService.getOrCreateUser(mockDecodedIdToken);

            expect(syncUserToDbTask.isOk).toBe(true);
            if (syncUserToDbTask.isOk) {
                expect(getUserTaskSpy).toHaveBeenCalled()
                expect(createUserTaskSpy).toHaveBeenCalledWith(mockUser);
                expect(syncUserToDbTask.value).toMatchObject(mockUser)
            }
        })
    })
})
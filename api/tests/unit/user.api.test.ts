import { beforeEach, it, expect, describe, vi } from 'vitest';
import request from 'supertest';
import createDiContainer from 'di.ts';
import { mockDecodedIdToken, mockUser } from '../mocks/firebase.mocks.ts';
import { Task } from 'true-myth/task';
import { asValue } from 'awilix';

describe('User API Endpoints', () => {
    const container = createDiContainer();
    // mock token verification to prevent failing tests
    container.register({
        tokenVerificationMiddleware: asValue((req, _, next) => {
            req.user = mockDecodedIdToken;
            next();
        })
    })
    const { app, userService } = container.cradle;

    
    describe('User endpoints', async () => {
        describe('POST /users/me', () => {
            beforeEach(() => {
                vi.clearAllMocks();
            })

            it('should return a 200 upon sync success', async () => {
                vi.spyOn(userService, 'getOrCreateUser')
                    .mockReturnValue(Task.resolve(mockUser)
                );
                const response = await request(app)
                    .post('/users/me');

                expect(response.statusCode).toBe(200);
            });
            
            it('should return a 500 upon sync failure', async () => {
                vi.spyOn(userService, 'getOrCreateUser')
                    .mockReturnValue(Task.reject(new Error('Test error'))
                );
                const response = await request(app)
                    .post('/users/me')

                expect(response.statusCode).toBe(500);
                expect(response.body).toHaveProperty('error');
            })
        })

    })
})
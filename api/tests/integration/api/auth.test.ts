import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createAuthRouter } from '../../../src/modules/auth/auth.routes';
import { mockAuthRepository } from '../../mocks/auth/repository.mock';
import { createAuthController } from '../../../src/modules/auth/auth.controller';
import { createApp } from '../../../src/app';
import type { Express } from 'express';

describe('Auth API Module', () => {
    let app: Express;
    
    beforeAll(() => {
        // Mock auth repo so that we don't need to use db for test.
        // Integration tests on repository layer in another test suite confirm if repo layer
        // can be trusted
        const authRepo = mockAuthRepository;
        const authController = createAuthController(authRepo);
        const authRouter = createAuthRouter(authController);
        app = createApp({ authRouter });
    });

    test('POST /auth/permissions ', async () => {
        
        const response = await request(app)
            .post('/auth/permissions')
            .send({ permission: "orders:update" })

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');

        expect(response.body.name).toBe('orders:update');
    });
});


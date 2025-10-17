import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import 'dotenv/config';
import { prisma } from '../../../src/config/db.config';
import { createAuthRepository } from '../../../src/modules/auth/auth.repository';


describe('Permissions Handler', () => {
    const authRepo = createAuthRepository(prisma);

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    test('should create a permission', async () => {
        const createdPermission = await authRepo.permissions.create("roles:create");
        expect(createdPermission.name).toBe("roles:create");
        console.log(createdPermission);
    });
});
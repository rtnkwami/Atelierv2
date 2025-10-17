import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';
import 'dotenv/config';
import { prisma } from '../../../src/config/db.config';
import { createAuthRepository } from '../../../src/modules/auth/auth.repository';


describe('Permissions Handler', () => {
    const authRepo = createAuthRepository(prisma);

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    test('should create a permission', async () => {
        const createdPermission = await authRepo.permissions.create("roles:create");
        expect(createdPermission.name).toBe("roles:create");
        
        expect(createdPermission).toHaveProperty('id');
        expect(createdPermission).toHaveProperty('name');
        expect(createdPermission).toHaveProperty('createdAt');
        expect(createdPermission).toHaveProperty('updatedAt');
    });

    test('should list all permissions if no filter is given', async () => {
        await authRepo.permissions.create("roles:delete");
        await authRepo.permissions.create("roles:update");
        
        const result = await authRepo.permissions.list();
        
        expect(result).toHaveProperty('permissions');
        expect(result).toHaveProperty('permissionsCount');
        expect(result).toHaveProperty('totalPages');
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('limit');

        expect(result.permissions).toHaveLength(2);
    });

    test('should list all permissions given a full permission name', async () => {
        await authRepo.permissions.create("permissions:create");
        await authRepo.permissions.create("permissions:update");
        await authRepo.permissions.create("permissions:delete");

        const { permissions } = await authRepo.permissions.list('permissions:delete');

        expect(permissions).toHaveLength(1);
        expect(permissions[0].name).toBe('permissions:delete');
    });
});
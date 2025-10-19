import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';
import 'dotenv/config';
import { prisma } from '../../../src/config/db.config';
import { createAuthRepository } from '../../../src/modules/auth/auth.repository';


describe('Permission Management', () => {
    const authRepo = createAuthRepository(prisma);

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    afterEach(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "Permissions" CASCADE;`
    });

    describe('Creating Permissions', () => {
        test('should create a permission', async () => {
            const createdPermission = await authRepo.permissions.create("roles:create");
            expect(createdPermission.name).toBe("roles:create");
            
            expect(createdPermission).toHaveProperty('id');
            expect(createdPermission).toHaveProperty('name');
            expect(createdPermission).toHaveProperty('createdAt');
            expect(createdPermission).toHaveProperty('updatedAt');
        });
    });


    describe('Searching for Permissions', () => {
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
    
            const { permissions } = await authRepo.permissions.list({ name: 'permissions:delete' });
    
            expect(permissions).toHaveLength(1);
            expect(permissions[0].name).toBe('permissions:delete');
        });

        test('should list all permissions with names matching provided filter', async () => {
            await authRepo.permissions.create("permissions:create");
            await authRepo.permissions.create("permissions:update");
            await authRepo.permissions.create("permissions:delete");
            await authRepo.permissions.create("roles:delete");
            await authRepo.permissions.create("roles:update");

            let result;

            result = await authRepo.permissions.list({ name: 'roles'});
            expect(result.permissionsCount).toBe(2);

            result = await authRepo.permissions.list({ name: 'permissions' });
            expect(result.permissionsCount).toBe(3);

            result = await authRepo.permissions.list({ name: ':delete' });
            expect(result.permissionsCount).toBe(2);
        });
    });

    describe('Updating Permissions', () => {
        test('should update a permission given a permission id', async () => {
            const permission = await authRepo.permissions.create("roles:create");

            const updatedPermission = await authRepo.permissions.update(
                permission.id, "permissions:create"
            );

            expect(updatedPermission.name).toBe("permissions:create")
        });

        test('should throw an update error given nonexistent id', async () => {
            const nonexistentPermissionId = '123e4567-e89b-12d3-a456-426614174000'
            
            await expect(
                authRepo.permissions.update(
                nonexistentPermissionId, 'invalid:permission'
                )
            ).rejects.toThrow(`Permission with id: ${ nonexistentPermissionId } does not exist`);
        });
    });

    describe('Deleting Permissions', () => {
        test('should delete a permission', async () => {
            const permissionToDelete = await authRepo.permissions.create('shops:create');
            const deletedPermission = await authRepo.permissions.delete(permissionToDelete.id);
            
            expect(deletedPermission.name).toBe('shops:create');
        });
    });
});
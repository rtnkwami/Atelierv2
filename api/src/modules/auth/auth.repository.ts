import type { Permissions, PrismaClient } from "../../../prisma-client/client";
import { z } from 'zod';

const permissionRegex = z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/);
type PermissionFilter = z.infer<typeof permissionRegex>;

export type IAuthRepository = {
    permissions: {
        create: (permission: PermissionFilter) => Promise<Permissions>;
    }
}

export const createAuthRepository = (prisma: PrismaClient): IAuthRepository => ({
    permissions: {
        create: async (permission) => {
            const newPermission = await prisma.permissions.create({
                data: {
                    name: permission
                }
            });

            return newPermission;
        },
    }
});

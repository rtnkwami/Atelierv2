import type { Permissions, PrismaClient } from "../../../prisma-client/client";
import { z } from 'zod';

const permissionRegex = z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/);
type PermissionFilter = z.infer<typeof permissionRegex>;

export type IAuthRepository = {
    permissions: {
        create: (permission: PermissionFilter) => Promise<Permissions>;
        
        list: (filter?: string, pagination?: {
            page: number,
            limit: number
        }) => Promise<{
            permissions: Permissions[],
            page: number,
            limit: number,
            totalPages: number,
            permissionsCount: number
        }>;
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

        list: async (filter, pagination = { page: 1, limit: 20 }) => {            
            const where = filter
                ? {
                    name: {
                    contains: filter,
                    mode: 'insensitive' as const,
                    },
                }
                : {};

            const [permissions, permissionsCount] = await prisma.$transaction([
                prisma.permissions.findMany({
                    where,
                    skip: (pagination.page - 1) * pagination.limit,
                    take: pagination.limit,
                }),
                prisma.permissions.count({ where }),
            ]);

            return {
                permissions,
                page: pagination.page,
                limit: pagination.limit,
                permissionsCount,
                totalPages: Math.ceil(permissionsCount / pagination.limit),
            };
        },
    }
});

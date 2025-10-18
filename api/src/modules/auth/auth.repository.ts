import type { Permissions, PrismaClient } from "../../../prisma-client/client";
import { z } from 'zod';
import logger from "@config/logger.config";

const permissionSchema = z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/);


export interface IAuthRepository {
    permissions: {
        create: (permission: string) => Promise<Permissions>;
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

const authRepoLogger = logger.child({ module: 'auth', layer: 'repository' });

export const createAuthRepository = (prisma: PrismaClient): IAuthRepository => ({
    permissions: {
        create: async (permission) => {
            try {
                const parsedPermission = permissionSchema.parse(permission);

                const newPermission = await prisma.permissions.create({
                    data: {
                        name: parsedPermission
                    }
                });
                
                authRepoLogger.info(`Permission "${ newPermission.name } created"`);
                return newPermission;

            } catch (error) {
                authRepoLogger.error({ error }, 'Database Error');
                throw error;
            }
        },

        list: async (filter, pagination = { page: 1, limit: 20 }) => {            
            try {
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

            } catch (error) {
                authRepoLogger.error({ error }, "Database Error");
                throw error;
            }
        },
    }
});

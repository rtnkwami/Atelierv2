import type { Permissions, PrismaClient } from "../../../prisma-client/client";
// import { z } from 'zod';
import logger from "@config/logger.config";
import { PermissionsWhereInput } from "../../../prisma-client/models";

// const permissionSchema = z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/);


export interface IAuthRepository {
    permissions: {
        create: (permission: string) => Promise<Permissions>;
        list: (filter?: {
            name?: string,
            id?: string
        }, pagination?: {
            page: number,
            limit: number
        }) => Promise<{
            permissions: Permissions[],
            page: number,
            limit: number,
            totalPages: number,
            permissionsCount: number
        }>;
        update: (permissionId: string, updateInput:string) => Promise<Permissions>;
        delete: (permissionId: string) => Promise<Permissions>;
    }
}

const authRepoLogger = logger.child({ module: 'auth', layer: 'repository' });

export const createAuthRepository = (prisma: PrismaClient): IAuthRepository => ({
    permissions: {
        create: async (permission) => {
            try {
                const newPermission = await prisma.permissions.create({
                    data: {
                        name: permission
                    }
                });
                
                authRepoLogger.info(`Permission "${ newPermission.name }" created`);
                return newPermission;

            } catch (error) {
                authRepoLogger.error({ error }, 'Failed to create permission');
                throw error;
            }
        },

        list: async (filter, pagination = { page: 1, limit: 20 }) => {            
            try {
                const where: PermissionsWhereInput  = { };
                if (filter?.id) { where.id = filter.id };
                if (filter?.name) { 
                    where.name =  {
                        contains: filter.name,
                        mode: 'insensitive'
                    }
                }
    
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

        update: async (permissionId, updateInput) => {
            try {
                /** Purpose: database transaction is here to prevent a vulnerability where
                 * permission is read before deletion.
                 * 
                 * This code ensures that the updated permission cannot be read while or before
                 * it is being deleted due to async actions.
                 */
                const updatedPermission = prisma.$transaction(async (tx) => {
                    const oldPermission = await tx.permissions.findUnique({ 
                            where: { id: permissionId } 
                        });

                    if (!oldPermission){ 
                        throw new Error(`Permission with id: ${ permissionId } does not exist`)
                    }

                    const updatedPermission = await tx.permissions.update({ 
                        where: { id: permissionId },
                        data: { name: updateInput }
                    });
    
                    authRepoLogger.info(
                        `Permission "${ oldPermission.name }" changed to "${ updatedPermission.name }"`
                    );

                    return updatedPermission;
                });

                return updatedPermission;
                 
            } catch (error) {
                authRepoLogger.info({ error }, 'Failed to update permission');
                throw error;
            }
        },

        delete: async (permissionId) => {
            try {                
                const deletedPermission =  await prisma.permissions.delete({
                        where: {
                            id: permissionId
                        }
                    });

                 authRepoLogger.info(`Permission "${ deletedPermission.name }" deleted`)

                 return deletedPermission;
            } catch (error) {
                authRepoLogger.error({ error }, 'Failed to delete permission');
                throw new Error(`Permission with id "${ permissionId } does not exist"`);
            }
        }
    }
});

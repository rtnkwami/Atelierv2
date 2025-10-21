import { IAuthRepository } from "../../../src/modules/auth/auth.repository";
import { jest } from '@jest/globals';
import { randomUUID as uuidv4 } from "crypto";
import { Permissions } from "../../../prisma-client/client";

interface IMockAuthRepository extends IAuthRepository {}

export const mockAuthRepository: IMockAuthRepository = {
    permissions: {
            create: async (permission: string): Promise<Permissions> => {
                const newPermission: Permissions = {
                    id: uuidv4(),
                    name: permission,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                
                return newPermission;
            }
        }
}
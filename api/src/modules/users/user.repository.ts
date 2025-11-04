import { DatabaseError, NotFoundError } from "../../error.ts";
import { PrismaClient } from "@db-client/client.ts";
import { UsersCreateInput } from "@db-client/models.ts";
import type { Roles, Users } from "@db-client/client.ts";
import Task, { tryOrElse } from "true-myth/task";
import { TransactionClient } from "@db-client/internal/prismaNamespace.ts";

export interface IUserRepository {
    createUser: (userData: UsersCreateInput, tx?: TransactionClient) => Task<Users, DatabaseError>;
    getUser: (userId: string, tx?: TransactionClient) => Task<Users, NotFoundError | DatabaseError>;
    assignRoleToUser: (userId: string, roleName: string, tx?: TransactionClient) => Task<{
        id: string,
        roles: {
            name: string
        }[] 
    }, DatabaseError>;
    getRole: (roleName: string, tx?: TransactionClient) => Task<Roles, NotFoundError | DatabaseError>;
}

type dependencies = {
    db: PrismaClient
}

export const createUserRepository = ({ db }: dependencies): IUserRepository => ({    
    getUser: (userId, tx) =>
        tryOrElse(
            (reason) => {
                if (reason instanceof NotFoundError) {
                    return reason;
                }
                return new DatabaseError(`Database query failed: ${ String(reason) }`);
            },
            async () => {
                const client = tx ?? db;
                const user = await client.users.findUnique({
                    where: { id: userId }
                });

                if (!user) {
                    throw new NotFoundError(`User "${userId}" does not exist`);
                }
                return user;
            }
        ),
    createUser: (userData, tx) =>
        tryOrElse(
            (reason) => new DatabaseError('Error creating user', { cause: reason }),
            async () => {
                const client = tx ?? db;
                const newUser = await client.users.create({
                    data: {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        avatar: userData.avatar,
                        roles: {
                            connect: {
                                name: 'buyer'
                            }
                        }
                    },
                    include: {
                        roles: true
                    }
                });
                return newUser;
            }
        ),
    assignRoleToUser: (userId, roleName, tx) =>
        tryOrElse(
            (reason) => {
                return new DatabaseError('Error getting user roles', { cause: reason })
            },
            async () => {
                const client = tx ?? db;
                const userRoles = await client.users.update({
                    where: { id: userId },
                    data: {
                        roles: { connect: { name: roleName } }
                    },
                    select: {
                        id: true,
                        roles: {
                            select: { name: true }
                        }
                    }
                });
                
                return userRoles;
            }
        ),
        getRole: (roleName, tx) =>
            tryOrElse(
                (reason) => {
                    if (reason instanceof NotFoundError) { return reason };
                    return new DatabaseError('Error getting role', { cause: reason });
                },
                async () => {
                    const client = tx ?? db;
                    const role = await client.roles.findUnique({
                        where: {
                            name: roleName
                        }
                    });
                    if (!role) { throw new NotFoundError(`Role "${ roleName }" does not exist`) }

                    return role;
                }
            )
});
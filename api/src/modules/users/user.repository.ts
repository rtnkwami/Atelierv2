import { DatabaseError, NotFoundError } from "../../error.ts";
import { PrismaClient } from "@db-client/client.ts";
import { UsersCreateInput } from "@db-client/models.ts";
import type { Users } from "@db-client/client.ts";
import Task, { tryOrElse } from "true-myth/task";

export interface IUserRepository {
    createUser: (userData: UsersCreateInput) => Task<Users, DatabaseError>;
    getUser: (userId: string) => Task<Users, NotFoundError | Error>;
    assignRoleToUser: (userId: string, roleName: string) => Task<{
        id: string,
        roles: {
            name: string
        }[] 
    }, DatabaseError | NotFoundError>
}

type dependencies = {
    db: PrismaClient
}

export const createUserRepository = ({ db }: dependencies): IUserRepository => ({    
    getUser: (userId) =>
        tryOrElse(
            (reason) => {
                if (reason instanceof NotFoundError) {
                    return reason;
                }
                return new Error(`Database query failed: ${ String(reason) }`);
            },
            async () => {
                const user = await db.users.findUnique({
                    where: { id: userId }
                });

                if (!user) {
                    throw new NotFoundError(`User "${userId}" does not exist`);
                }
                return user;
            }
        ),
    createUser: (userData) =>
        tryOrElse(
            (reason) => new DatabaseError('Error creating database', { cause: reason }),
            async () => {
                const newUser = await db.users.create({
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
    assignRoleToUser: (userId, roleName) =>
        tryOrElse(
            (reason) => {
                if (reason instanceof NotFoundError) { return reason }
                return new DatabaseError('Error getting user roles', { cause: reason })
            },
            async () => {
                const user = await db.users.findUnique({ where: { id: userId } });
                if (!user) {
                    throw new NotFoundError(`User "${ userId }" does not exist`)
                }
                
                const validatedRole = await db.roles.findFirst({ where: { name: roleName } });
                if (!validatedRole) { throw new NotFoundError(`Role "${ roleName }" does not exist`) }

                const userRoles = await db.users.update({
                    where: { id: userId },
                    data: {
                        roles: { connect: { id: validatedRole.id } }
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
        )
});
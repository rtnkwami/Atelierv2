import { DatabaseError, NotFoundError } from "../../error.ts";
import { PrismaClient } from "../../../prisma-client/client.ts";
import { UsersCreateInput } from "../../../prisma-client/models.ts";
import type { Users } from "../../../prisma-client/client.ts";
import Task, { tryOrElse } from "true-myth/task";

export interface IUserRepository {
    createUser: (userData: UsersCreateInput) => Task<Users, DatabaseError>;
    getUser: (userId: string) => Task<Users, NotFoundError | Error>;
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
            )
});
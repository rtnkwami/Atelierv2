import { NotFoundError } from "../../error";
import { PrismaClient } from "../../../prisma-client/client";
import { UsersCreateInput } from "../../../prisma-client/models";
import type { Users } from "../../../prisma-client/client";
import Task, { tryOrElse } from "true-myth/task";

export interface IUserRepository {
    createUser: (userData: UsersCreateInput) => Promise<Users>;
    getUser: (userId: string) => Task<Users, NotFoundError>;
}

type dependencies = {
    db: PrismaClient
}

export const createUserRepository = ({ db }: dependencies): IUserRepository => ({
    createUser: async (userData) => {
        const newUser = await db.users.create({ data: userData });
        return newUser;     
    },
    
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
        )
});
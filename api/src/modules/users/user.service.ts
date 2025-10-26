import { IUserRepository } from "./user.repository"
import { Users }from "../../../prisma-client/client";
import logger from "@config/logger.config";
import { NotFoundError } from "error";


export interface IUserService {
    getOrCreateUser: (userData: Users) => Promise<Users>;
}

type dependencies = {
    userRepo: IUserRepository
}

const userServiceLogger = logger.child({ module: 'users', layer: 'service' });

export const createUserService = ({ userRepo }: dependencies): IUserService => ({
    getOrCreateUser: async (userData) => {
        const task = await userRepo.getUser(userData.id);

        const user = await task.match({
            Ok: async (user) => user,
            Err: async (error) => {
                if (error instanceof NotFoundError) {
                    const newUser = await userRepo.createUser(userData);
                    userServiceLogger.info(`User "${ newUser.id }" created`);
                    return newUser;
                }
                userServiceLogger.error({ error });
                throw error;
            }
        });

        return user;
    }
});
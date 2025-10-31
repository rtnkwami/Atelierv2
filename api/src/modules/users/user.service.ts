import { IUserRepository } from "./user.repository.ts"
import { Users }from "../../../prisma-client/client.ts";
import { NotFoundError, UserSyncError } from "error.ts";
import Task, { tryOrElse } from "true-myth/task";
import { Logger } from "pino";
import { DecodedIdToken } from "firebase-admin/auth";


 export interface IUserService {
    getOrCreateUser: (userData: DecodedIdToken) => Task<Users, UserSyncError>;
    // upgradeUserToSeller: (userId: string) => Task<Users, ServiceError>;
}

type dependencies = {
    userRepo: IUserRepository;
    baseLogger: Logger;
}


export const createUserService = ({ userRepo, baseLogger }: dependencies): IUserService => {
    const userServiceLogger = baseLogger.child({ module: 'users', layer: 'service' });
        
    return {
        getOrCreateUser: (userData) =>
            tryOrElse(
                (reason) => {
                    userServiceLogger.error({ error: reason }, 'Error syncing user');
                    return new UserSyncError('Error syncing user', { cause: reason })
                },
                async () => {
                    const createUserDto: Users = {
                        id: userData.uid,
                        name: userData.email ?? '',
                        email: userData.email ?? '',
                        avatar: userData.picture ?? ''
                    }

                    const getUserTask = await userRepo.getUser(createUserDto.id);
                    
                    if (getUserTask.isOk) {
                        return getUserTask.value;
                    };

                    if (getUserTask.isErr && getUserTask.error instanceof NotFoundError) {
                        const createUserTask = await userRepo.createUser(createUserDto);

                        if (createUserTask.isErr) {
                            throw createUserTask.error;
                        }
                        const user = createUserTask.value
                        userServiceLogger.info(`User ${ user.id } created`);
                        return user;
                    }
                    throw getUserTask.error;
                }
            ),
        }
    }
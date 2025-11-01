import { IUserRepository } from "./user.repository.ts"
import { Users }from "@db-client/client.ts";
import { NotFoundError, SellerUpgradeError, UserSyncError } from "error.ts";
import Task, { tryOrElse } from "true-myth/task";
import { Logger } from "pino";
import { DecodedIdToken } from "firebase-admin/auth";
import { task } from "true-myth";


 export interface IUserService {
    getOrCreateUser: (userData: DecodedIdToken) => Task<Users, UserSyncError>;
    // upgradeUserToSeller: (userId: string) => Task<{
    //         id: string,
    //         roles: {
    //             name: string
    //         }[] 
    //     }, SellerUpgradeError>;
}

type dependencies = {
    userRepo: IUserRepository;
    baseLogger: Logger;
}


export const createUserService = ({ userRepo, baseLogger }: dependencies): IUserService => {
    const userServiceLogger = baseLogger.child({ module: 'users', layer: 'service' });
        
    return {
        getOrCreateUser: (userData) => {
            const createUserDto: Users = {
                id: userData.uid,
                name: userData.email ?? '',
                email: userData.email ?? '',
                avatar: userData.picture ?? ''
            }

            return userRepo.getUser(createUserDto.id) // Ok(user)
                .orElse(error => {
                    if (error instanceof NotFoundError) {
                        return userRepo.createUser(createUserDto)
                            .map(user => {
                                userServiceLogger.info(`User ${ user.id } created`);
                                return user;
                            })
                    }
                    return task.reject(error); // error other than NotFoundError
                })
                .mapRejected(reason => {
                    userServiceLogger.error({ error: reason }, 'Error syncing user');
                    return new UserSyncError('Error syncing user', { cause: reason });
                })
        }
        
    }
}
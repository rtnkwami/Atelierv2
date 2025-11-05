import { IUserRepository } from "./user.repository.ts"
import { PrismaClient, Users }from "@db-client/client.ts";
import { NotFoundError, SellerUpgradeError, UserSyncError } from "error.ts";
import Task from "true-myth/task";
import { Logger } from "pino";
import { DecodedIdToken } from "firebase-admin/auth";
import { task } from "true-myth";
import { runWithTransaction } from "async.context.ts";
import { IShopService } from "modules/shops/shop.service.ts";
import { Shops } from "@db-client/client.ts";


 export interface IUserService {
    getOrCreateUser: (userData: DecodedIdToken) => Task<Users, UserSyncError>;
    upgradeUserToSeller: (userData: DecodedIdToken) => Task<[
        {
            id: string,
            roles: {
                name: string
            }[],
        }, Shops
    ], SellerUpgradeError>;
}

type dependencies = {
    userRepo: IUserRepository;
    baseLogger: Logger;
    db: PrismaClient;
    shopService: IShopService;
}


export const createUserService = ({ userRepo, baseLogger, db, shopService }: dependencies): IUserService => {
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
                    return task.reject(error);
                })
                .mapRejected(reason => {
                    userServiceLogger.error({ error: reason }, 'Error syncing user');
                    return new UserSyncError('Error syncing user', { cause: reason });
                })
        },
        upgradeUserToSeller: (userData) => {
            const createUserDto: Users = {
                id: userData.uid,
                name: userData.email ?? '',
                email: userData.email ?? '',
                avatar: userData.picture ?? ''
            }

            return task.all([
                userRepo.getUser(createUserDto.id),
                userRepo.getRole('seller')
            ])
            .andThen(([user, role]) => {
                return runWithTransaction(db, () => {
                    return task.all([
                       userRepo.assignRoleToUser(user.id, role.name),
                       shopService.createShopForUser(userData)
                    ]);
                })
            })
            .mapRejected(reason => {
                userServiceLogger.error(
                    { error: reason },
                    `Error upgrading user "${ createUserDto.id }" to seller`
                )
                return new SellerUpgradeError('Error upgrading user as seller', { cause: reason })
            })
        }
    }
}
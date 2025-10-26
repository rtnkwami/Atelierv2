import { IUserService } from "modules/users/user.service"
import { Users } from "../../../prisma-client/client";
import { DecodedIdToken } from "firebase-admin/auth";
import logger from "@config/logger.config";


export interface IAuthService {
    register: (userData: DecodedIdToken) => Promise<Users>;
}

type dependencies = {
    userService: IUserService
}

const authServiceLogger = logger.child({ module: 'auth', layer: 'service' })

export const createAuthService = ({ userService }: dependencies): IAuthService => ({
    register: async (userData) => {
        try {
            const userDto: Users = {
                id: userData.uid,
                name: userData.email ?? '',
                email: userData.email ?? '',
                avatar: userData.picture ?? ''
            }
            const user = await userService.getOrCreateUser(userDto);
            return user
        } catch (error) {
            authServiceLogger.error({ error })
            throw error;
        }
    }
});
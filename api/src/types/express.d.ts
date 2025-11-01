/** Purpose: This file exists because req.user doesn't exist on an Express request.
 * This causes Typescript to complain if req.user is referenced or assigned any values.
 * By extending the Request type globally, we can use req.user in places such as
 * @link verifyJwt.ts for middleware
 */

import type { DecodedIdToken } from "firebase-admin/auth"

declare global {
    namespace Express {
        interface Request {
            user: DecodedIdToken
        }
    }
}

export {};
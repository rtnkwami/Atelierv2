import { z } from 'zod';

type AuthSchema = { 
    createPermissionSchema: z.ZodType
}


const authSchema: AuthSchema = {
    createPermissionSchema: z.object({
        permission: z.string().regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/, {
            error: "Permission must match 'resource:action' format (e.g., orders:create)"
        })
    }),
}

export default authSchema;
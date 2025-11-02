declare const vi: any;

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const baseSchema = z.object({
    api: z.object({
        port: z.number().nonnegative(),
    }),
    db: z.object({
        url: z.string(),
    }),
    auth: z.object({
        projectId: z.string().nonempty(),
    }),
});

type Config = z.infer<typeof baseSchema>;

const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    typeof vi !== 'undefined'

const env = {
    api: {
        port: Number(process.env.API_PORT),
    },
    db: {
        url: process.env.DATABASE_URL,
    },
    auth: {
        projectId: process.env.FIREBASE_PROJECT_ID,
    },
};

const schema = isTestEnv
    ? baseSchema.extend({
        db: z.object({ url: z.string().optional() }),
        auth: z.object({ projectId: z.string().optional() }),
        })
    : baseSchema;

const parsedEnv = schema.parse(env);

if (isTestEnv) {
    parsedEnv.db.url ??= 'test-db-url';
    parsedEnv.auth.projectId ??= 'test-project-id';
}

export default parsedEnv as Config;

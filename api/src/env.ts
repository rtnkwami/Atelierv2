import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const configSchema = z.object({
    api: z.object({
        port: z.number().nonnegative()
    }),
    db: z.object({
        url: z.string(),
    }),
    auth: z.object({
        projectId: z.string().nonempty()
    })
});

type Config = z.infer<typeof configSchema>

const env = {
    api: {
        port: Number(process.env.API_PORT)
    },
    db: {
        url: process.env.DATABASE_URL
    },
    auth: {
        projectId: process.env.FIREBASE_PROJECT_ID
    }
};

const config: Config = configSchema.parse(env);

export default config;
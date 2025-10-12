/**Purpose: The code in this file exists to catch errors in environment variables at runtime
 * and to reduce issues where errors take a long time to resolve due to missing or incorrect
 * variables.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const configSchema = z.object({
    api: z.object({
        port: z.number().nonnegative()
    }),
    db: z.object({
        url: z.string().optional(),
        name: z.string().nonempty(),
        user: z.string().nonempty(),
        password: z.string().nonempty(),
        host: z.string().nonempty(),
        dialect: z.enum([
            'mysql',
            'postgres',
            'sqlite',
            'mariadb',
            'mssql',
            'db2',
            'oracle'
        ]),
        port: z.number().nonnegative()
    }),
    auth: z.object({
        projectId: z.string().nonempty()
    })
});

type Config = z.infer<typeof configSchema>

const env = {
    api: {
        port: Number(process.env.PORT)
    },
    db: {
        name: process.env.DB_NAME || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || '',
        dialect: process.env.DB_DIALECT || '',
        url: process.env.DB_URL || '', // URL in case the db changes from a SQL db to another type
        port: Number(process.env.DB_PORT)
    },
    auth: {
        projectId: process.env.FIREBASE_PROJECT_ID || ''
    }
};

const config: Config = configSchema.parse(env);

export default config;
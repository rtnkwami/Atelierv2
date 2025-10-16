import { defineConfig } from 'prisma/config';

import 'dotenv/config'; // needed for env variables

export default defineConfig({
    schema: "./prisma",
    migrations: {
        path: "./prisma/migrations",
    }
});
import config from "../env.ts";
import { PrismaClient } from "../../prisma-client/client.ts";

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.db.url
        }
    },
});


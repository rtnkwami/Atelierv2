import config from "../env";
import { PrismaClient } from "../../prisma-client/client";

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.db.url
        }
    },
});


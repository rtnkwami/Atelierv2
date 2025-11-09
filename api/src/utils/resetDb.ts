import { PrismaClient } from "@db-client/client.ts";

export default async function resetDb(db: PrismaClient) {
    await db.$transaction([
        db.products.deleteMany(),
        db.shops.deleteMany(),
        db.users.deleteMany()
    ]);
};
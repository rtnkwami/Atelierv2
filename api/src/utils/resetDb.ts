import { AwilixContainer } from "awilix";
import { PrismaClient } from "../../prisma-client/client.ts";

export default async function resetDb(container: AwilixContainer) {
    const prisma: PrismaClient = container.resolve('db');
    await prisma.$transaction([
        prisma.users.deleteMany()
    ]);
};
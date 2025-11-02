import createDiContainer from "di.ts";

export default async function resetDb(container: ReturnType<typeof createDiContainer>) {
    const prisma = container.resolve('db');
    await prisma.$transaction([
        prisma.shops.deleteMany(),
        prisma.users.deleteMany()
    ]);
};
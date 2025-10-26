// prisma/seed.ts
import { prisma } from "../src/config/db.config";

async function main() {
  console.log('Start seeding ...');

  // Create default roles
  await prisma.roles.upsert({
    where: { name: 'buyer' },
    update: {},
    create: { name: 'buyer' },
  });

  await prisma.roles.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

    await prisma.roles.upsert({
    where: { name: 'seller' },
    update: {},
    create: { name: 'seller' },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
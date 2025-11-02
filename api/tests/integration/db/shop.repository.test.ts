import resetDb from '@utils/resetDb.ts';
import createDiContainer from 'di.ts'
import { beforeEach, afterAll, it, expect, describe } from 'vitest'
import { mockUser } from '../../mocks/firebase.mocks.ts';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { DatabaseError } from 'error.ts';

describe('Shop repository', async () => {
    await using postgresContainer = await new PostgreSqlContainer('postgres:18').start();
    process.env.DATABASE_URL = postgresContainer.getConnectionUri();

    execSync("npx prisma db push --force-reset", { stdio: "inherit" });

    const container = createDiContainer();
    const { db, shopRepo, userRepo } = container.cradle;

    beforeEach(async () => {
        await resetDb(container);
    });
    
    afterAll(async () => {
        await db.$disconnect();
    })

    
    describe('shop creation', () => {
        const shopData = {
            name: 'Test shop',
            description: 'a shop specifically for this test',
        };

        it('should return a created shop', async () => {
            
           const createShopTask = await userRepo.createUser(mockUser)
                .andThen(() => {
                    return shopRepo.createShop(mockUser.id, shopData)
                });
    
            expect(createShopTask.isOk).toBe(true);
            if (createShopTask.isOk) {
                expect(createShopTask.value.usersId).toEqual(mockUser.id);
                expect(createShopTask.value.name).toEqual(shopData.name);
                expect(createShopTask.value.description).toEqual(shopData.description);
            }
        });

        it('should return a database error on failure', async () => {
            const createShopTask = await shopRepo.createShop('nonexistent user id', shopData);

            expect(createShopTask.isErr).toBe(true);
            if (createShopTask.isErr) {
                expect(createShopTask.error).toBeInstanceOf(DatabaseError);
            }
        })
    })

});
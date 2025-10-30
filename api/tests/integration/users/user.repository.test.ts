import { describe, beforeAll, afterEach, it, expect, afterAll } from 'vitest';
import createDiContainer from "../../../src/di.ts";
import resetDB from '../../../src/utils/resetDb.ts'
import { NotFoundError } from '../../../src/error.ts';

describe('User Repository', () => {
    const container = createDiContainer();
    const prisma = container.resolve('db');
    const userRepo = container.resolve('userRepo');

    beforeAll(async () => {
            await resetDB(container);
        });
    
    afterEach(async () => {
        await resetDB(container);
    });

    afterAll(async () => {
        await prisma.$disconnect()
    })

    describe('user creation', () => {
        it('should create new user', async () => {
            const createUserTask = await userRepo.createUser({
                id: "2d43frg5g53",
                name: 'John Doe',
                email: 'jd@gmail.com',
                avatar: 'https://funnypics.com/jojo.png'
            });
    
            expect(createUserTask.isOk).toBe(true);
    
            if (createUserTask.isOk) {
                const newUser = createUserTask.value;

                expect(newUser).toMatchObject({
                    id: "2d43frg5g53",
                    name: 'John Doe',
                    email: 'jd@gmail.com',
                    avatar: 'https://funnypics.com/jojo.png'
                })
            }
        });
    })

    describe('user lisitng', () => {
        it('should get a user', async () => {
            await userRepo.createUser({
                id: '123456',
                name: 'Mary Jane',
                email: 'mj@outlook.com',
                avatar: 'https://reallygoodlooking.com/mj.jpg'
            });

            const getUserTask = await userRepo.getUser('123456');
            expect(getUserTask.isOk).toBe(true);
            
            if(getUserTask.isOk) {
                expect(getUserTask.value).toMatchObject({
                    id: '123456',
                    name: 'Mary Jane',
                    email: 'mj@outlook.com',
                    avatar: 'https://reallygoodlooking.com/mj.jpg'
                })
            }
        });

        it('should return a NotFoundError on nonexistent user', async () => {
            const getUserTask = await userRepo.getUser('123456');
            expect(getUserTask.isErr).toBe(true);
            
            if (getUserTask.isErr){
                expect(getUserTask.error).toBeInstanceOf(NotFoundError);
            }
        })
    })
});
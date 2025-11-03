import { describe, beforeEach, it, expect, afterAll } from 'vitest';
import createDiContainer from "../../../src/di.ts";
import resetDb from '@utils/resetDb.ts'
import { DatabaseError, NotFoundError } from '../../../src/error.ts';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

describe('User Repository', async () => {
    await using postgresContainer = await new PostgreSqlContainer('postgres:18').start();
    const connectionUri = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}@${postgresContainer.getHost()}:${postgresContainer.getPort()}/${postgresContainer.getDatabase()}`;
    process.env.DATABASE_URL = connectionUri;

    execSync("npx prisma db push --force-reset", {
        stdio: "inherit",
        env: {
            ...process.env,
            DATABASE_URL: connectionUri
        }
    });

    const container = createDiContainer();
    const { db, userRepo } = container.cradle;
    
    beforeEach(async () => {
        await resetDb(db);
    });

    afterAll(async () => {
        await db.$disconnect()
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
        });
    })
    
    
    describe('user updating', () => {
        it('should update user roles', async () => {
            const createUserTask = await userRepo.createUser({
                id: '123456',
                name: 'Mary Jane',
                email: 'mj@outlook.com',
                avatar: 'https://reallygoodlooking.com/mj.jpg'
            });
            expect(createUserTask.isOk).toBe(true);
    
            if (createUserTask.isOk){
                const newUser = createUserTask.value
                const getUserRolesTask = await userRepo.assignRoleToUser(newUser.id, 'seller');
    
                if(getUserRolesTask.isErr){ throw getUserRolesTask.error }
    
                expect(getUserRolesTask.value).toHaveProperty('id');
                expect(getUserRolesTask.value).toHaveProperty('roles');
                expect(getUserRolesTask.value.roles).toHaveLength(2);
            }
        })
    
        
        it('should throw a database error on failure', async () => {
            const getUserRolesTask = await userRepo.assignRoleToUser('12345', 'seller');
            expect(getUserRolesTask.isErr).toBe(true);
            
            if (getUserRolesTask.isErr) {
                expect(getUserRolesTask.error).toBeInstanceOf(DatabaseError);
            }
        });
    })

    describe('user auth actions', () => {
        it('should return a role given a role name', async () => {
            const getRoleTask = await userRepo.getRole('seller');

            expect(getRoleTask.isOk).toBe(true);
            if (getRoleTask.isOk) {
                expect(getRoleTask.value).toHaveProperty('id');
                expect(getRoleTask.value).toHaveProperty('name');
                expect(getRoleTask.value.name).toBe('seller');
            }
        });

        
        it('should throw a not found error on nonexistent role', async () => {
            const getRoleTask = await userRepo.getRole('invalid_role');
            expect(getRoleTask.isErr).toBe(true);

            if (getRoleTask.isErr){
                expect(getRoleTask.error).toBeInstanceOf(NotFoundError);
            }
        })
    })
});
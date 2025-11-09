import { describe, beforeEach, it, expect, afterAll } from 'vitest';
import createDiContainer from "../../../src/di.ts";
import resetDb from '@utils/resetDb.ts'
import { DatabaseError, NotFoundError } from '../../../src/error.ts';
import { mockUser } from '../../mocks/firebase.mocks.ts';

describe('User Repository', async () => {
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
            const task = await userRepo.createUser(mockUser);

            task.match({
                Ok: (newUser) => {
                    expect(newUser).toMatchObject(mockUser);
                },
                Err: (error) => {
                    console.error('Error during user creation test', error);
                    expect.fail('User creation should have succeeded');
                }
            });
        });
    })

    describe('user listing', () => {
        it('should get a user', async () => {
            const task = await userRepo.createUser(mockUser)
                .andThen(() => userRepo.getUser(mockUser.id));

            task.match({
                Ok: (user) => {
                    expect(user).toMatchObject(mockUser);
                },
                Err: (error) => {
                    console.error('Error during user listing test', error);
                    expect.fail('Get user should have succeeded');
                }
            });
        });

        it('should return a NotFoundError on nonexistent user', async () => {
            const task = await userRepo.getUser('123456')
            
            task.match({
                Ok: () => { expect.fail('Should not have found user'); },
                Err: (error) => {
                    expect(error).toBeInstanceOf(NotFoundError);
                }
            });
        });
    })
    
    describe('user updating', () => {
        it('should update user roles', async () => {
            const task = await userRepo.createUser(mockUser)
                .andThen((newUser) => userRepo.assignRoleToUser(newUser.id, 'seller'))
    
            task.match({
                Ok: (userWithRoles) => {
                    expect(userWithRoles).toHaveProperty('id');
                    expect(userWithRoles).toHaveProperty('roles');
                    expect(userWithRoles.roles).toHaveLength(2);
                },
                Err: (error) => {
                    console.error('Error during user role update test', error);
                    expect.fail('Role assignment should have succeeded');
                }
            });
        })
    
        it('should throw a database error on failure', async () => {
            const task = await userRepo.assignRoleToUser('12345', 'seller')
            
            task.match({
                Ok: () => { expect.fail('Should have failed with DatabaseError'); },
                Err: (error) => {
                    expect(error).toBeInstanceOf(DatabaseError);
                }
            });
        });
    })

    describe('user auth actions', () => {
        it('should return a role given a role name', async () => {
            const task = await userRepo.getRole('seller')

            task.match({
                Ok: (role) => {
                    expect(role).toHaveProperty('id');
                    expect(role).toHaveProperty('name');
                    expect(role.name).toBe('seller');
                },
                Err: (error) => {
                    console.error('Error during role listing test', error);
                    expect.fail('Get role should have succeeded');
                }
            });
        });

        it('should throw a not found error on nonexistent role', async () => {
            const task = await userRepo.getRole('invalid_role')
            
            task.match({
                Ok: () => { expect.fail('Should not have found role'); },
                Err: (error) => {
                    expect(error).toBeInstanceOf(NotFoundError);
                }
            });
        })
    })
});
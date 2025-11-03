import { describe, beforeEach, it, expect, afterAll } from 'vitest';
import createDiContainer from "../../../src/di.ts";
import resetDb from '@utils/resetDb.ts'
import { DatabaseError, NotFoundError, IntegrationTestError } from '../../../src/error.ts';

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
            const createUserTask = await userRepo.createUser({
                id: "2d43frg5g53",
                name: 'John Doe',
                email: 'jd@gmail.com',
                avatar: 'https://funnypics.com/jojo.png'
            })
            .mapRejected(reason => new IntegrationTestError('Unexpected error during user creation test', { cause: reason }));
    
            createUserTask.match({
                Ok: (newUser) => {
                    expect(newUser).toMatchObject({
                        id: "2d43frg5g53",
                        name: 'John Doe',
                        email: 'jd@gmail.com',
                        avatar: 'https://funnypics.com/jojo.png'
                    });
                },
                Err: (error) => {
                    console.error('Failed to create user:', error);
                    expect.fail('User creation should have succeeded');
                }
            });
        });
    })

    describe('user listing', () => {
        it('should get a user', async () => {
            await userRepo.createUser({
                id: '123456',
                name: 'Mary Jane',
                email: 'mj@outlook.com',
                avatar: 'https://reallygoodlooking.com/mj.jpg'
            });

            const getUserTask = await userRepo.getUser('123456')
                .mapRejected(reason => new IntegrationTestError('Unexpected error during get user test', { cause: reason }));
            
            getUserTask.match({
                Ok: (user) => {
                    expect(user).toMatchObject({
                        id: '123456',
                        name: 'Mary Jane',
                        email: 'mj@outlook.com',
                        avatar: 'https://reallygoodlooking.com/mj.jpg'
                    });
                },
                Err: (error) => {
                    console.error('Failed to get user:', error);
                    expect.fail('Get user should have succeeded');
                }
            });
        });

        it('should return a NotFoundError on nonexistent user', async () => {
            const getUserTask = await userRepo.getUser('123456')
                .mapRejected(reason => new IntegrationTestError('Unexpected error during get nonexistent user test', { cause: reason }));
            
            getUserTask.match({
                Ok: (user) => {
                    console.error('Unexpectedly found user:', user);
                    expect.fail('Should not have found user');
                },
                Err: (error) => {
                    console.log('Expected error:', error);
                    expect(error.cause).toBeInstanceOf(NotFoundError);
                }
            });
        });
    })
    
    describe('user updating', () => {
        it('should update user roles', async () => {
            const updateUserRolesTask = await userRepo.createUser({
                id: '123456',
                name: 'Mary Jane',
                email: 'mj@outlook.com',
                avatar: 'https://reallygoodlooking.com/mj.jpg'
            })
            .andThen((newUser) => {
                return userRepo.assignRoleToUser(newUser.id, 'seller');
            })
            .mapRejected(reason => new IntegrationTestError('Unexpected error during role assignment test', { cause: reason }));
    
            updateUserRolesTask.match({
                Ok: (userWithRoles) => {
                    expect(userWithRoles).toHaveProperty('id');
                    expect(userWithRoles).toHaveProperty('roles');
                    expect(userWithRoles.roles).toHaveLength(2);
                },
                Err: (error) => {
                    console.error('Failed to update user roles:', error);
                    expect.fail('Role assignment should have succeeded');
                }
            });
        })
    
        it('should throw a database error on failure', async () => {
            const getUserRolesTask = await userRepo.assignRoleToUser('12345', 'seller')
                .mapRejected(reason => new IntegrationTestError('Unexpected error during database error test', { cause: reason }));
            
            getUserRolesTask.match({
                Ok: (result) => {
                    console.error('Unexpectedly succeeded:', result);
                    expect.fail('Should have failed with DatabaseError');
                },
                Err: (error) => {
                    console.log('Expected error:', error);
                    expect(error.cause).toBeInstanceOf(DatabaseError);
                }
            });
        });
    })

    describe('user auth actions', () => {
        it('should return a role given a role name', async () => {
            const getRoleTask = await userRepo.getRole('seller')
                .mapRejected(reason => new IntegrationTestError('Unexpected error during get role test', { cause: reason }));

            getRoleTask.match({
                Ok: (role) => {
                    expect(role).toHaveProperty('id');
                    expect(role).toHaveProperty('name');
                    expect(role.name).toBe('seller');
                },
                Err: (error) => {
                    console.error('Failed to get role:', error);
                    expect.fail('Get role should have succeeded');
                }
            });
        });

        it('should throw a not found error on nonexistent role', async () => {
            const getRoleTask = await userRepo.getRole('invalid_role')
                .mapRejected(reason => new IntegrationTestError('Unexpected error during get invalid role test', { cause: reason }));
            
            getRoleTask.match({
                Ok: (role) => {
                    console.error('Unexpectedly found role:', role);
                    expect.fail('Should not have found role');
                },
                Err: (error) => {
                    console.log('Expected error:', error);
                    expect(error.cause).toBeInstanceOf(NotFoundError);
                }
            });
        })
    })
});
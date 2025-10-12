import { DataTypes, Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    Sequelize
 } from "sequelize";

/** Purpose: RoleAttributes and RoleCreationAttributes exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

export interface IRoles extends Model<InferAttributes<IRoles>, InferCreationAttributes<IRoles>> {
    id: CreationOptional<string>,
    name: string
}

/**
 * Purpose: decouple sequelize client from database to allow for the roles model
 * to be initialised during testing with a test database.
 * 
 * @param sequelizeClient 
 * @returns Roles Model
 */

export function initRoles(sequelizeClient: Sequelize) {
    return sequelizeClient.define<IRoles>('Roles', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, { tableName: 'roles' });
}
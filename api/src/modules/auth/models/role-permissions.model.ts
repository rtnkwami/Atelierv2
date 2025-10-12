import { Model, DataTypes,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    Sequelize
 } from "sequelize";

/** Purpose: RolePermissionAttributes and RolePermissionCreationAttributes exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

export interface IRolePermissions extends Model<InferAttributes<IRolePermissions>, InferCreationAttributes<IRolePermissions>>{
    id: CreationOptional<string>,
    role_id: string,
    permission_id: string
}

/**
 * Purpose: decouple sequelize client from database to allow for the role_permissions model
 * to be initialised during testing with a test database.
 * 
 * @param sequelizeClient 
 * @returns RolePermissions Model
 */

export function initRolePermissions(sequelizeClient: Sequelize) {
    return sequelizeClient.define<IRolePermissions>('RolePermissions', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        permission_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },{ tableName: 'role_permissions' });
}
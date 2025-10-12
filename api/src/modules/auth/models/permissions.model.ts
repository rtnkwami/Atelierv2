import { Model, DataTypes,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    Sequelize, 
} from 'sequelize';

/** Purpose: IPermissions exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

export interface IPermissions extends Model<InferAttributes<IPermissions>, InferCreationAttributes<IPermissions>> {
    id: CreationOptional<string>;
    name: string;
}

/**
 * Purpose: decouple sequelize client from database to allow for the permissions model
 * to be initialised during testing with a test database.
 * 
 * @param sequelizeClient 
 * @returns Permissions Model
 */

export function initPermissions(sequelizeClient: Sequelize) {
    return sequelizeClient.define<IPermissions>('Permissions', {
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
    }, { tableName: 'permissions' });
}
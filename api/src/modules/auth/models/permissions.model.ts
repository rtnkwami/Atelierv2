import { sequelize } from "@config/db.config.ts";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/** Purpose: PermissionAttributes and PermissionCreationAttributes exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

type PermissionAttributes = {
    id: string,
    name: string
}

type PermissionCreationAttributes = Optional<PermissionAttributes, 'id'>

const Permissions = sequelize.define<Model<PermissionAttributes, PermissionCreationAttributes>>('Permissions', {
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
},{ tableName: 'permissions' });

export default Permissions;
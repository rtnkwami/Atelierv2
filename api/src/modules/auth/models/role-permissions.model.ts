import { sequelize } from "@config/db.config.ts";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/** Purpose: RolePermissionAttributes and RolePermissionCreationAttributes exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

type RolePermissionAttributes = {
    id: string,
    role_id: string,
    permission_id: string
}

type RolePermissionCreationAttributes = Optional<RolePermissionAttributes, 'id'>;

const RolePermissions = sequelize.define<Model<RolePermissionAttributes, RolePermissionCreationAttributes>>('RolePermissions', {
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

export default RolePermissions;
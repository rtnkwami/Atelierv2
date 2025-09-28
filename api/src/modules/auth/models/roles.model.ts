import { sequelize } from "@config/db.config.ts";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

/** Purpose: RoleAttributes and RoleCreation attributes exist within this file to inform
 * Typescript of the attributes needed to create a role. Useful for intellisense and type
 * checking
 */

type RoleAttributes = {
    id: string,
    name: string
}

type RoleCreationAttributes = Optional<RoleAttributes, "id">

const Roles = sequelize.define<Model<RoleAttributes, RoleCreationAttributes>>('Roles', {
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

export default Roles;
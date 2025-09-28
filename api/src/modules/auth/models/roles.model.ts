import { sequelize } from "@config/db.config.ts";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";

type RoleAttributes = {
    id: string,
    name: string
}

type RoleCreationAttributes = Optional<RoleAttributes, "id">

const Role = sequelize.define<Model<RoleAttributes, RoleCreationAttributes>>('Roles', {
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

export default Role;
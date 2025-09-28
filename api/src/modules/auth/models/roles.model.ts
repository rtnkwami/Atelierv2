import { sequelize } from "@config/db.config.ts";
import { DataTypes } from "sequelize";

const Roles = sequelize.define('Roles', {
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
});

export default Roles;
/** Purpose of this file: to act as the central point for all module models to be exported
 * and synced at the entrypoint of the API.
 * 
 * It also acts as the location for defining clearly the relationships between all models in the
 * schema.
 * 
 * There are no other reasons for this file existence.
 */
import { initPermissions } from "@auth/models/permissions.model";
import { initRolePermissions } from "@auth/models/role-permissions.model";
import { initRoles } from "@auth/models/roles.model";
import { Sequelize } from "sequelize";

export function initializeDatabase(sequelizeClient: Sequelize) {
    const Permissions = initPermissions(sequelizeClient);
    const Roles = initRoles(sequelizeClient);
    const RolePermissions = initRolePermissions(sequelizeClient);

    Roles.hasMany(RolePermissions, { foreignKey: 'role_id' });
    RolePermissions.belongsTo(Roles, { foreignKey: 'role_id' });

    Permissions.hasMany(RolePermissions, { foreignKey: 'permission_id' });
    RolePermissions.belongsTo(Permissions, { foreignKey: 'permission_id' });

    return {
        Permissions,
        Roles,
        RolePermissions
    }
};
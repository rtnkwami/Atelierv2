/** Purpose of this file: to act as the central point for all module models to be exported
 * and synced at the entrypoint of the API.
 * 
 * It also acts as the location for defining clearly the relationships between all models in the
 * schema.
 * 
 * There are no other reasons for this file existence.
 */

import { Roles, RolePermissions, Permissions } from "@auth/models";

Roles.hasMany(RolePermissions, { foreignKey: 'role_id' });
RolePermissions.belongsTo(Roles, { foreignKey: 'role_id' });

Permissions.hasMany(RolePermissions, { foreignKey: 'permission_id' });
RolePermissions.belongsTo(Permissions, { foreignKey: 'permission_id' });


export { Roles, RolePermissions, Permissions };
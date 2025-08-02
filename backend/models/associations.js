const Role = require('./Role.js');
const Module = require('./Module.js');
const RoleModule = require('./RoleModule.js');
const User = require('./User.js');

function initAssociations() {
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleDetails' });
  Role.hasMany(User, { foreignKey: 'roleId' });
  Role.belongsToMany(Module, { through: RoleModule, as: 'modules', foreignKey: 'role_id' });
  Module.belongsToMany(Role, { through: RoleModule, as: 'roles', foreignKey: 'module_id' });

}
module.exports=initAssociations;
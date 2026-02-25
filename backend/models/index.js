const { sequelize } = require("../config/db");
const User = require("./User");
const Project = require("./Project");
const Task = require("./Task");
const Role = require("./Role");
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");

/* ======================
   ROLE & PERMISSION ASSOCIATIONS
====================== */

User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
});

/* ======================
   PROJECT & TASK ASSOCIATIONS
====================== */

// These foreignKey names must match the 'field' property in your models
User.hasMany(Project, { foreignKey: "userId", onDelete: "CASCADE" });
Project.belongsTo(User, { foreignKey: "userId" });

Project.hasMany(Task, { foreignKey: "projectId", onDelete: "CASCADE" });
Task.belongsTo(Project, { foreignKey: "projectId" });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  Role,
  Permission,
  RolePermission,
};
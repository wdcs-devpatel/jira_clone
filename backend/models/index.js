const { sequelize } = require("../config/db");

const User = require("./User");
const Project = require("./Project");
const Task = require("./Task");

/* ASSOCIATIONS */

User.hasMany(Project, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Project.belongsTo(User, {
  foreignKey: "userId",
});

Project.hasMany(Task, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});

Task.belongsTo(Project, {
  foreignKey: "projectId",
});

module.exports = {
  sequelize,
  User,
  Project,
  Task,
};
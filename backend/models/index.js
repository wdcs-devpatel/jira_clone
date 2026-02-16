const { sequelize } = require("../config/db");

const Project = require("./Project");
const Task = require("./Task");

/* ASSOCIATIONS */
Project.hasMany(Task, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});

Task.belongsTo(Project, {
  foreignKey: "projectId",
});

module.exports = {
  sequelize,
  Project,
  Task,
};

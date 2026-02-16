const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "todo",
  },

  priority: {
    type: DataTypes.STRING,
    defaultValue: "medium",
  },

  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  assigneeId: {
    type: DataTypes.INTEGER,
  },

  subtasks: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  comments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Task;

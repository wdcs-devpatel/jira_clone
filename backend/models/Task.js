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
  // 🔥 Map to exact camelCase column names in pgAdmin
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'projectId' // ⚠️ Matches database column exactly
  },
  // 🔥 Map to exact camelCase column names in pgAdmin
  assigneeId: {
    type: DataTypes.INTEGER,
    field: 'assigneeId' // ⚠️ Matches database column exactly
  },
  // ✅ JSON format allows the subtasks/comments arrays from the frontend to be saved directly
  subtasks: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: "Tasks", // ⚠️ Matches capitalized table name in pgAdmin
  timestamps: true,   // Matches createdAt and updatedAt columns
});

module.exports = Task;
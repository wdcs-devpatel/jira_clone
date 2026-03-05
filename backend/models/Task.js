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
  // ✅ CHANGE: Updated defaultValue to "To Do" to match the frontend Kanban columns
  status: {
    type: DataTypes.STRING,
    defaultValue: "To Do", 
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: "medium",
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'projectId' 
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    field: 'assigneeId' 
  },
  subtasks: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: "Tasks", 
  timestamps: true,  
});

module.exports = Task;
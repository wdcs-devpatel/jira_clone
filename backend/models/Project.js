const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: "medium",
  },
  teamLeader: {
    type: DataTypes.STRING,
  },
  // 🔥 Map to exact camelCase column in pgAdmin
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId'
  },
  members: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: "Projects", // ⚠️ Matches capitalized table name in pgAdmin
  timestamps: true,      // Uses createdAt and updatedAt
});

module.exports = Project;
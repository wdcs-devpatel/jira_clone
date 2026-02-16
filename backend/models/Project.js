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
  userId: {
    type: DataTypes.STRING,
    allowNull: false, // Every project must belong to a user
  },
}, {
  timestamps: true,
});

module.exports = Project;
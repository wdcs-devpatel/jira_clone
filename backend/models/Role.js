const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, { 
  tableName: 'roles',
  underscored: true, // 🔥 This tells Sequelize to look for created_at instead of createdAt
  timestamps: true 
});

module.exports = Role;
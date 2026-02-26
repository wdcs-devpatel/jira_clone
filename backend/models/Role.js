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
  underscored: true, 
  timestamps: true 
});

module.exports = Role;
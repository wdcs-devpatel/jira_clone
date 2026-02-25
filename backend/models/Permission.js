const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Permission = sequelize.define("Permission", {
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
}, { 
  tableName: 'permissions',
  underscored: true, // 🔥 Add this
  timestamps: true 
});

module.exports = Permission;
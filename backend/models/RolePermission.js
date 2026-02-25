const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const RolePermission = sequelize.define("role_permissions", {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  timestamps: false // 🚀 CRITICAL
});

module.exports = RolePermission;